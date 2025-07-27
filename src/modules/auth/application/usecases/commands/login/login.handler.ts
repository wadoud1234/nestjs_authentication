import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { InjectPasswordHasher, PasswordHasher } from "@/modules/auth/application/services/password-hasher.service";
import { InvalidCredentialsException } from "@/modules/auth/domain/exceptions/invalid-credentials.exception";
import { LoginCommand } from "./login.command";
import { LoginCommandResult } from "./login.result";
import { Provider } from "@nestjs/common";
import { AuthJwtPayload } from "@/modules/auth/_sub-modules/jwts/domain/types/auth-jwt-payload.types";
import { Database, InjectDatabase } from "@/shared/infrastructure/database/database.module";
import { usersTable } from "@/shared/infrastructure/database/schema/users.table";
import { eq } from "drizzle-orm";
import { InjectUsersRepository, UsersRepository } from "@/modules/users/infrastructure/repositories/users.repository";
import { UserResponsePayload } from "@/modules/users/presentation/contracts/responses/user.response";

export interface LoginCommandHandler extends ICommandHandler<LoginCommand> { }

@CommandHandler(LoginCommand)
export class LoginCommandHandlerImpl implements LoginCommandHandler {

    constructor(
        @InjectPasswordHasher() private readonly passwordHasher: PasswordHasher,
        @InjectUsersRepository() private readonly usersRepository: UsersRepository
    ) { }

    async execute({ email, password }: LoginCommand): Promise<LoginCommandResult> {
        const user = await this.verifyUserExist(email);

        const passwordMatches = await this.passwordHasher.verify(user.password, password);
        if (!passwordMatches) {
            throw new InvalidCredentialsException("Wrong Password")
        }

        return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        }

    }

    private async verifyUserExist(email: string): Promise<UserResponsePayload & { password: string }> {
        const whereCondition = eq(usersTable.email, email)
        const user = await this.usersRepository.findUserByWhereAsUserResponseAndPassword(whereCondition)

        if (!user) throw new InvalidCredentialsException("User doesnt exist");
        return user
    }
}

export const LoginCommandHandlerToken = Symbol("LoginCommandHandler");

export const LoginCommandHandlerProvider: Provider = {
    provide: LoginCommandHandlerToken,
    useClass: LoginCommandHandlerImpl
} 
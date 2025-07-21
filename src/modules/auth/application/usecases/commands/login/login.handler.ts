import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { InjectPasswordHasher, PasswordHasher } from "../../../services/password-hasher.service";
import { InjectUsersRepository, UsersRepository } from "@/modules/users/infrastructure/repositories/users.repository";
import { InvalidCredentialsException } from "@/modules/auth/domain/exceptions/invalid-credentials.exception";
import { UserDatabaseMapper } from "@/modules/auth/infrastructure/mappers/users.mapper";
import { LoginCommand } from "./login.command";
import { LoginCommandResult } from "./login.result";
import { Provider } from "@nestjs/common";

@CommandHandler(LoginCommand)
export class LoginCommandHandler implements ICommandHandler<LoginCommand> {

    constructor(
        @InjectPasswordHasher() private readonly passwordHasher: PasswordHasher,
        @InjectUsersRepository() private readonly usersRepository: UsersRepository
    ) { }

    async execute({ email, password }: LoginCommand): Promise<LoginCommandResult> {
        const user = await this.verifyUserExist(email);

        const passwordMatches = await this.passwordHasher.verify(user.password, password);
        if (!passwordMatches) {
            throw new InvalidCredentialsException()
        }

        return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        }
    }

    private async verifyUserExist(email: string) {
        const user = await this.usersRepository.findOneByEmail(email, {
            columns: {
                ...UserDatabaseMapper.selectUserResponse,
                password: true
            }
        })
        if (!user) throw new InvalidCredentialsException();
        return user;
    }
}

export const LoginCommandHandlerToken = Symbol("LoginCommandHandler");

export const LoginCommandHandlerProvider: Provider = {
    provide: LoginCommandHandlerToken,
    useClass: LoginCommandHandler
} 
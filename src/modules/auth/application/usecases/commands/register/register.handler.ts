import { Command, CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { LoginRequestBody } from "src/modules/auth/presentation/contracts/requests/login.request"
import { InjectPasswordHasher, PasswordHasher } from "../../../services/password-hasher.service";
import { InjectUsersRepository, UsersRepository } from "@/modules/users/infrastructure/repositories/users.repository";
import { InvalidCredentialsException } from "@/modules/auth/domain/exceptions/invalid-credentials.exception";
import { UserResponsePayload } from "@/modules/users/presentation/contracts/responses/user.response";
import { RegisterRequestBody } from "@/modules/auth/presentation/contracts/requests/register.request";
import { EmailAlreadyUsed } from "@/modules/auth/domain/exceptions/user-already-exists.exception";
import { UserDatabaseMapper } from "@/modules/auth/infrastructure/mappers/users.mapper";
import { RegisterCommand } from "./register.command";
import { RegisterCommandResult } from "./register.result";
import { Provider } from "@nestjs/common";



@CommandHandler(RegisterCommand)
export class RegisterCommandHandler implements ICommandHandler<RegisterCommand> {

    constructor(
        @InjectPasswordHasher() private readonly passwordHasher: PasswordHasher,
        @InjectUsersRepository() private readonly usersRepository: UsersRepository
    ) { }

    async execute({ name, email, password }: RegisterCommand): Promise<RegisterCommandResult> {
        await this.verifyUserDoesntExist(email);

        const hashedPassword = await this.passwordHasher.hash(password);

        const [newUser] = await this.usersRepository.insertBuilder
            .values({
                name,
                email,
                password: hashedPassword
            })
            .returning(UserDatabaseMapper.mapDatabaseReturnToUserResponse);

        return newUser;
    }

    private async verifyUserDoesntExist(email: string) {
        const user = await this.usersRepository.findOneByEmail(email, {
            columns: { id: true }
        })
        if (!user) return;
        throw new EmailAlreadyUsed();
    }
}

export const RegisterCommandHandlerToken = Symbol("RegisterCommandHandler")

export const RegisterCommandHandlerProvider: Provider = {
    provide: RegisterCommandHandlerToken,
    useClass: RegisterCommandHandler
}
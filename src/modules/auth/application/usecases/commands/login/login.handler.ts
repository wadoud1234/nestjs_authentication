import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { InjectPasswordHasher, PasswordHasher } from "@/modules/auth/application/services/password-hasher.service";
import { InvalidCredentialsException } from "@/modules/auth/domain/exceptions/invalid-credentials.exception";
import { LoginCommand } from "./login.command";
import { LoginCommandResult } from "./login.result";
import { Provider } from "@nestjs/common";
import { AuthJwtPayload } from "@/modules/auth/_sub-modules/jwts/domain/types/auth-jwt-payload.types";
import { DatabaseService, InjectDatabase } from "@/shared/infrastructure/database/database.module";
import { usersTable } from "@/shared/infrastructure/database/schema/users.table";
import { eq } from "drizzle-orm";

@CommandHandler(LoginCommand)
export class LoginCommandHandler implements ICommandHandler<LoginCommand> {

    constructor(
        @InjectPasswordHasher() private readonly passwordHasher: PasswordHasher,
        @InjectDatabase() private readonly database: DatabaseService
    ) { }

    async execute({ email, password }: LoginCommand): Promise<LoginCommandResult> {
        const user = await this.verifyUserExist(email);

        const passwordMatches = await this.passwordHasher.verify(user.password, password);
        if (!passwordMatches) {
            throw new InvalidCredentialsException("Wrong Password")
        }

        const jwtPayload: AuthJwtPayload = {
            sub: user.id,
            email: user.email,
            name: user.name,
            role: user.role
        }

        // const tokens = await this.generateAuthTokens(jwtPayload);

        return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        }

    }

    private async verifyUserExist(email: string) {
        const [user] = await this.database.select({
            id: usersTable.id,
            name: usersTable.name,
            email: usersTable.email,
            role: usersTable.role,
            password: usersTable.password
        })
            .from(usersTable)
            .where(eq(usersTable.email, email))
            .limit(1)

        if (user && user.id) return user
        throw new InvalidCredentialsException("User doesnt exist");
    }

    // private async generateAuthTokens(payload: AuthJwtPayload): Promise<AuthTokensPayload> {
    //     const [accessToken, refreshToken] = await Promise.all([
    //         this.accessTokenService.sign(payload),
    //         this.refreshTokenService.sign(payload)
    //     ])

    //     return {
    //         accessToken,
    //         refreshToken
    //     }
    // }
}

export const LoginCommandHandlerToken = Symbol("LoginCommandHandler");

export const LoginCommandHandlerProvider: Provider = {
    provide: LoginCommandHandlerToken,
    useClass: LoginCommandHandler
} 
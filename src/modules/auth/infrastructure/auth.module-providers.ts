import { Provider } from "@nestjs/common";
import { LoginCommandHandlerProvider } from "../application/usecases/commands/login/login.handler";
import { RegisterCommandHandlerProvider } from "../application/usecases/commands/register/register.handler";
import { PasswordHasherProvider } from "../application/services/password-hasher.service";
import { GetSessionHandlerProvider } from "../application/usecases/queries/get-session/get-session.handler";
import { RolesGuard } from "../presentation/guards/roles.guard";
import { AuthorizationService } from "../application/services/authz.service";

export const AuthGuards = [
    RolesGuard
]

export const AuthStrategies = []

export const AuthCommandHandlers: Provider[] = [
    LoginCommandHandlerProvider,
    RegisterCommandHandlerProvider,
];

export const AuthQueryHandlers: Provider[] = [
    GetSessionHandlerProvider
];

export const AuthServices: Provider[] = [
    PasswordHasherProvider,
    AuthorizationService
];
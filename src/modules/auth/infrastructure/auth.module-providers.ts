import { Provider } from "@nestjs/common";
import { LoginCommandHandlerProvider } from "../application/usecases/commands/login/login.handler";
import { RegisterCommandHandlerProvider } from "../application/usecases/commands/register/register.handler";
import { PasswordHasherProvider } from "../application/services/password-hasher.service";

export const AuthCommandHandlers: Provider[] = [
    LoginCommandHandlerProvider,
    RegisterCommandHandlerProvider,
];

export const AuthQueryHandlers: Provider[] = [

];

export const AuthServices: Provider[] = [
    PasswordHasherProvider
];
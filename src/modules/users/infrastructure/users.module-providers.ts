import { Provider } from "@nestjs/common";
import { UsersRepositoryProvider } from "./repositories/users.repository";

export const UsersModuleServices: Provider[] = []

export const UsersModuleRepositories: Provider[] = [
    UsersRepositoryProvider
]

export const UsersModuleQueryHandlers: Provider[] = []

export const UsersModuleCommandHandlers: Provider[] = []
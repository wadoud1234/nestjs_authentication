import { Provider } from "@nestjs/common";
import { UsersRepositoryProvider } from "./repositories/users.repository";
import { UserRolesRepositoryProvider } from "./repositories/user-roles.repository";

export const UsersModuleServices: Provider[] = []

export const UsersModuleRepositories: Provider[] = [
    UsersRepositoryProvider,
    UserRolesRepositoryProvider
]

export const UsersModuleQueryHandlers: Provider[] = []

export const UsersModuleCommandHandlers: Provider[] = []
import { Module } from "@nestjs/common";
import { UsersQueriesController } from "../presentation/controllers/users.queries-controller";
import { UsersCommandsController } from "../presentation/controllers/users.commands-controller";
import { UsersModuleCommandHandlers, UsersModuleQueryHandlers, UsersModuleRepositories, UsersModuleServices } from "./users.module-providers";

@Module({
    controllers: [
        UsersQueriesController,
        UsersCommandsController
    ],
    providers: [
        ...UsersModuleCommandHandlers,
        ...UsersModuleQueryHandlers,
        ...UsersModuleRepositories,
        ...UsersModuleServices
    ],
    exports: [
        ...UsersModuleRepositories,
        ...UsersModuleServices
    ]
})
export class UsersModule { }
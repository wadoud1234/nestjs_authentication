import { Module } from "@nestjs/common";
import { CategoriesModuleCommandHandlers, CategoriesModuleQueryHandlers, CategoriesModuleRepositories, CategoriesModuleServices } from "./categories.module-providers";
import { CategoriesQueriesController } from "../presentation/controllers/categories.queries-controller";
import { CategoriesCommandsController } from "../presentation/controllers/categories.commands-controller";

@Module({
    controllers: [
        CategoriesQueriesController,
        CategoriesCommandsController
    ],
    providers: [
        ...CategoriesModuleCommandHandlers,
        ...CategoriesModuleQueryHandlers,
        ...CategoriesModuleServices,
        ...CategoriesModuleRepositories
    ],
    exports: [
        ...CategoriesModuleServices,
        ...CategoriesModuleRepositories
    ]
})
export class CategoriesModule { }
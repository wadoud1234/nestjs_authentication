import { Module } from "@nestjs/common";
import { CartsCommandsController } from "../presentation/controllers/carts.commands-controller";
import { CartsQueriesController } from "../presentation/controllers/carts.queries-controller";
import { CartsModuleRepositories, CartsModuleCommandHandlers, CartsModuleQueryHandlers, CartsModuleServices } from "./carts.module-providers";

@Module({
    imports: [],
    controllers: [
        CartsQueriesController,
        CartsCommandsController
    ],
    providers: [
        ...CartsModuleRepositories,
        ...CartsModuleServices,
        ...CartsModuleCommandHandlers,
        ...CartsModuleQueryHandlers
    ],
    exports: [
        ...CartsModuleRepositories,
        ...CartsModuleServices,
    ]
})
export class CartsModule { }
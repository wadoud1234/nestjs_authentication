import { Module } from "@nestjs/common";
import { WishlistsQueriesController } from "../presentation/controllers/wishlists.queries-controller";
import { WishlistsCommandsController } from "../presentation/controllers/wishlists.commands-controller";
import { WishlistsModuleCommandHandlers, WishlistsModuleQueryHandlers, WishlistsModuleRepositories, WishlistsModuleServices } from "./wishlists.module-providers";

@Module({
    controllers: [
        WishlistsQueriesController,
        WishlistsCommandsController
    ],
    providers: [
        ...WishlistsModuleServices,
        ...WishlistsModuleCommandHandlers,
        ...WishlistsModuleQueryHandlers,
        ...WishlistsModuleRepositories

    ],
    exports: [
        ...WishlistsModuleServices,
        ...WishlistsModuleRepositories
    ]
})
export class WishlistsModule { }
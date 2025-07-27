import { Module } from "@nestjs/common";
import { WishlistsQueriesController } from "../presentation/controllers/wishlists.queries-controller";
import { WishlistsCommandsController } from "../presentation/controllers/wishlists.commands-controller";
import { WishlistsModuleCommandHandlers, WishlistsModuleQueryHandlers, WishlistsModuleServices } from "./wishlists.module-providers";

@Module({
    controllers: [
        WishlistsQueriesController,
        WishlistsCommandsController
    ],
    providers: [
        ...WishlistsModuleServices,
        ...WishlistsModuleCommandHandlers,
        ...WishlistsModuleQueryHandlers
    ],
    exports: [
        ...WishlistsModuleServices,
    ]
})
export class WishlistsModule { }
import { Provider } from "@nestjs/common";
import { GetWishlistQueryHandlerProvider } from "../application/usecases/queries/get-wishlist/get-wishlist.handler";
import { ToggleWishlistBookCommandHandlerProvider } from "../application/usecases/commands/toggle-wishlist/toggle-wishlist.handler";
import { WishlistsServiceProvider } from "../application/services/wishlists.service";
import { DeleteWishlistCommandHandlerProvider } from "../application/usecases/commands/delete-wishlist/delete-wishlist.handler";

export const WishlistsModuleServices: Provider[] = [
    WishlistsServiceProvider
]

export const WishlistsModuleCommandHandlers: Provider[] = [
    ToggleWishlistBookCommandHandlerProvider,
    DeleteWishlistCommandHandlerProvider
]

export const WishlistsModuleQueryHandlers: Provider[] = [
    GetWishlistQueryHandlerProvider
]
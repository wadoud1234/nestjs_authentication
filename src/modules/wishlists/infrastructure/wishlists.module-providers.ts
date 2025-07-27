import { Provider } from "@nestjs/common";
import { GetWishlistQueryHandlerProvider } from "../application/usecases/queries/get-wishlist/get-wishlist.handler";
import { ToggleWishlistBookCommandHandlerProvider } from "../application/usecases/commands/toggle-wishlist/toggle-wishlist.handler";
import { WishlistsRepositoryProvider } from "./repositories/wishlists.repository";
import { DeleteWishlistCommandHandlerProvider } from "../application/usecases/commands/delete-wishlist/delete-wishlist.handler";

export const WishlistsModuleServices: Provider[] = []

export const WishlistsModuleRepositories: Provider[] = [
    WishlistsRepositoryProvider
]

export const WishlistsModuleCommandHandlers: Provider[] = [
    ToggleWishlistBookCommandHandlerProvider,
    DeleteWishlistCommandHandlerProvider
]

export const WishlistsModuleQueryHandlers: Provider[] = [
    GetWishlistQueryHandlerProvider
]
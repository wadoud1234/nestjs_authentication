import { Provider } from "@nestjs/common";
import { CartsRepositoryProvider } from "./repositories/carts.repository";
import { CartItemsRepositoryProvider } from "./repositories/cart-items.repository";
import { GetCartQueryHandlerProvider } from "../application/usecases/queries/get-cart/get-cart.handler";
import { GetCartItemsCountQueryHandlerProvider } from "../application/usecases/queries/get-cart-items-count/get-cart-items-count.handler";
import { AddCartItemCommandHandlerProvider } from "../application/usecases/commands/add-cart-item/add-cart-item.handler";
import { UpdateCartItemQuantityCommandHandlerProvider } from "../application/usecases/commands/update-cart-item-quantity/update-cart-item-quantity.handler";
import { DeleteCartItemCommandHandlerProvider } from "../application/usecases/commands/delete-cart-item/delete-cart-item-quantity.handler";
import { ClearCartCommandHandlerProvider } from "../application/usecases/commands/clear-cart/clear-cart.handler";

export const CartsModuleRepositories: Provider[] = [
    CartsRepositoryProvider,
    CartItemsRepositoryProvider
]

export const CartsModuleCommandHandlers: Provider[] = [
    AddCartItemCommandHandlerProvider,
    UpdateCartItemQuantityCommandHandlerProvider,
    DeleteCartItemCommandHandlerProvider,
    ClearCartCommandHandlerProvider
]

export const CartsModuleQueryHandlers: Provider[] = [
    GetCartQueryHandlerProvider,
    GetCartItemsCountQueryHandlerProvider
]

export const CartsModuleServices: Provider[] = []
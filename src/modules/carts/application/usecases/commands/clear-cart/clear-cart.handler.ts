import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ClearCartCommand } from "./clear-cart.command";
import { ClearCartCommandResult } from "./clear-cart.result";
import { Provider } from "@nestjs/common";
import { CartItemsRepository, InjectCartItemsRepository } from "@/modules/carts/infrastructure/repositories/cart-items.repository";
import { eq } from "drizzle-orm";
import { cartItemsTable } from "@/shared/infrastructure/database/schema/cart-items.table";
import { CartsRepository, InjectCartsRepository } from "@/modules/carts/infrastructure/repositories/carts.repository";

export interface ClearCartCommandHandler extends ICommandHandler<ClearCartCommand> { }

@CommandHandler(ClearCartCommand)
export class ClearCartCommandHandlerImpl implements ClearCartCommandHandler {
    constructor(
        @InjectCartItemsRepository() private readonly cartItemsRepository: CartItemsRepository,
        @InjectCartsRepository() private readonly cartsRepository: CartsRepository
    ) { }

    async execute({ currentUserId }: ClearCartCommand): Promise<ClearCartCommandResult> {

        const cartId = await this.cartsRepository.getCartIdByUserId(currentUserId)

        await this.cartItemsRepository.deleteCartItemByWhere(eq(cartItemsTable.cartId, cartId))

        return {}
    }
}

export const ClearCartCommandHandlerToken = Symbol("ClearCartCommandHandler")

export const ClearCartCommandHandlerProvider: Provider = {
    provide: ClearCartCommandHandlerToken,
    useClass: ClearCartCommandHandlerImpl
}
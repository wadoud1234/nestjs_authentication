import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UpdateCartItemQuantityCommand } from "./update-cart-item-quantity.command";
import { UpdateCartItemQuantityCommandResult } from "./update-cart-item-quantity.result";
import { ConflictException, Provider } from "@nestjs/common";
import { Database, InjectDatabase } from "@/shared/infrastructure/database/database.module";
import { CartItemsRepository, InjectCartItemsRepository } from "@/modules/carts/infrastructure/repositories/cart-items.repository";

export interface UpdateCartItemQuantityCommandHandler extends ICommandHandler<UpdateCartItemQuantityCommand> { }

@CommandHandler(UpdateCartItemQuantityCommand)
export class UpdateCartItemQuantityCommandHandlerImpl implements UpdateCartItemQuantityCommandHandler {
    constructor(
        @InjectCartItemsRepository() private readonly cartItemsRepository: CartItemsRepository,
        @InjectDatabase() private readonly database: Database
    ) { }

    async execute({ cartItemId, quantity }: UpdateCartItemQuantityCommand): Promise<UpdateCartItemQuantityCommandResult> {
        const updatedCartItemQuantity = await this.database.transaction(async (tx) => {
            const cartItem = await this.cartItemsRepository.findCartItemWithQuantityById(cartItemId, tx)

            if (!cartItem) {
                throw new ConflictException("No cart item found");
            }

            const newQuantity = cartItem.quantity + quantity;

            const updatedQuantity = await this.cartItemsRepository.updateCartItemQuantityById(cartItemId, newQuantity, tx);

            return updatedQuantity;

        })
        return { quantity: updatedCartItemQuantity }
    }
}

export const UpdateCartItemQuantityCommandHandlerToken = Symbol("UpdateCartItemQuantityCommandHandler")

export const UpdateCartItemQuantityCommandHandlerProvider: Provider = {
    provide: UpdateCartItemQuantityCommandHandlerToken,
    useClass: UpdateCartItemQuantityCommandHandlerImpl
}
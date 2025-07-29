import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { DeleteCartItemCommand } from "./delete-cart-item.command";
import { DeleteCartItemCommandResult } from "./delete-cart-item.result";
import { ConflictException, Provider } from "@nestjs/common";
import { CartItemsRepository, InjectCartItemsRepository } from "@/modules/carts/infrastructure/repositories/cart-items.repository";
import { eq } from "drizzle-orm";
import { cartItemsTable } from "@/shared/infrastructure/database/schema/commerce/cart-items.table";

export interface DeleteCartItemCommandHandler extends ICommandHandler<DeleteCartItemCommand> { }

@CommandHandler(DeleteCartItemCommand)
export class DeleteCartItemCommandHandlerImpl implements DeleteCartItemCommandHandler {
    constructor(
        @InjectCartItemsRepository() private readonly cartItemsRepository: CartItemsRepository,
    ) { }

    async execute({ cartItemId }: DeleteCartItemCommand): Promise<DeleteCartItemCommandResult> {

        await this.cartItemsRepository.deleteCartItemByWhere(eq(cartItemsTable.id, cartItemId))

        return {}
    }
}

export const DeleteCartItemCommandHandlerToken = Symbol("DeleteCartItemCommandHandler")

export const DeleteCartItemCommandHandlerProvider: Provider = {
    provide: DeleteCartItemCommandHandlerToken,
    useClass: DeleteCartItemCommandHandlerImpl
}
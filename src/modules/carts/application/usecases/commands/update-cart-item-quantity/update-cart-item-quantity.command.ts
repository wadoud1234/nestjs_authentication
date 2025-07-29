import { Command } from "@nestjs/cqrs";
import { UpdateCartItemQuantityCommandResult } from "./update-cart-item-quantity.result";
import { UpdateCartItemQuantityRequestBody, UpdateCartItemQuantityRequestParams } from "@/modules/carts/presentation/contracts/requests/update-cart-item-quantity.request";

export class UpdateCartItemQuantityCommand extends Command<UpdateCartItemQuantityCommandResult> {
    constructor(
        public readonly cartItemId: string,
        public readonly quantity: number
    ) {
        super();
    }

    static from(
        body: UpdateCartItemQuantityRequestBody,
        params: UpdateCartItemQuantityRequestParams
    ): UpdateCartItemQuantityCommand {

        return new UpdateCartItemQuantityCommand(
            params.cartItemId,
            body.quantity
        );

    }
}
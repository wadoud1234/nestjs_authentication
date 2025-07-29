import { Command } from "@nestjs/cqrs";
import { DeleteCartItemCommandResult } from "./delete-cart-item.result";
import { DeleteCartItemRequestParams } from "@/modules/carts/presentation/contracts/requests/delete-cart-item.request";

export class DeleteCartItemCommand extends Command<DeleteCartItemCommandResult> {

    constructor(public readonly cartItemId: string) {
        super();
    }

    static from(params: DeleteCartItemRequestParams): DeleteCartItemCommand {

        return new DeleteCartItemCommand(
            params.cartItemId,
        );

    }
}
import { Command } from "@nestjs/cqrs";
import { DeleteWishlistCommandResult } from "./delete-wishlist.result";
import { DeleteWishlistRequestParams } from "@/modules/wishlists/presentation/contracts/requests/delete-wishlist.request";

export class DeleteWishlistCommand extends Command<DeleteWishlistCommandResult> {
    constructor(
        public readonly id: string
    ) {
        super();
    }

    static from(params: DeleteWishlistRequestParams): DeleteWishlistCommand {
        return new DeleteWishlistCommand(params.id)
    }
}
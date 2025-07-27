import { Command } from "@nestjs/cqrs";
import { ToggleWishlistBookCommandResult } from "./toggle-wishlist.result";
import { ToggleWishlistBookRequestParams } from "@/modules/books/presentation/contracts/requests/toggle-wishlist-book.request";
import { UserEntity } from "@/modules/users/domain/entities/user.entity";

export class ToggleWishlistBookCommand extends Command<ToggleWishlistBookCommandResult> {
    constructor(
        public readonly bookId: string,
        public readonly userId: string
    ) {
        super();
    }

    static from(params: ToggleWishlistBookRequestParams, currentUser: UserEntity): ToggleWishlistBookCommand {
        return new ToggleWishlistBookCommand(params.id, currentUser.id)
    }
}
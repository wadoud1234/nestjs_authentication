import { AddCartItemRequestBody } from "@/modules/carts/presentation/contracts/requests/add-cart-item.request";
import { UserEntity } from "@/modules/users/domain/entities/user.entity";
import { Command } from "@nestjs/cqrs";
import { AddCartItemCommandResult } from "./add-cart-item.result";

export class AddCartItemCommand extends Command<AddCartItemCommandResult> {
    constructor(
        public readonly bookId: string,
        public readonly quantity: number,
        public readonly currentUserId: string
    ) {
        super();
    }

    static from(body: AddCartItemRequestBody, currentUser: UserEntity): AddCartItemCommand {
        return new AddCartItemCommand(
            body.bookId,
            body.quantity,
            currentUser.id
        )
    }
}
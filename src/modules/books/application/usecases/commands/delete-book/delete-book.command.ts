import { Command } from "@nestjs/cqrs";
import { DeleteBookCommandResult } from "./delete-book.result";
import { DeleteBookRequestParams } from "@/modules/books/presentation/contracts/requests/delete-book.request";
import { UserEntity } from "@/modules/users/domain/entities/user.entity";

export class DeleteBookCommand extends Command<DeleteBookCommandResult> {
    constructor(
        public readonly bookId: string,
        public readonly currentUser: UserEntity
    ) {
        super()
    }

    public static from(params: DeleteBookRequestParams, currentUser: UserEntity) {
        return new DeleteBookCommand(params.bookId, currentUser)
    }
}
import { Command } from "@nestjs/cqrs";
import { UpdateBookCommandResult } from "./update-book.result";
import { UpdateBookRequestBody, UpdateBookRequestParams } from "@/modules/books/presentation/contracts/requests/update-book.request";
import { UserEntity } from "@/modules/users/domain/entities/user.entity";

export class UpdateBookCommand extends Command<UpdateBookCommandResult> {
    constructor(
        public readonly bookId: string,
        public readonly title: string,
        public readonly description: string,
        public readonly pages: number,
        public readonly price: string,
        public readonly stock: number,
        public readonly isbn: string,
        public readonly categoryIds: string[],
        public readonly isPublished: boolean,
        public readonly currentUser: UserEntity,
    ) {
        super()
    }

    public static from(
        body: UpdateBookRequestBody,
        params: UpdateBookRequestParams,
        currentUser: UserEntity
    ) {
        return new UpdateBookCommand(
            params.id,
            body.title,
            body.description,
            body.pages,
            body.price,
            body.stock,
            body.isbn,
            Array.from(new Set(body.categoryIds)),
            body.isPublished,
            currentUser
        );
    }
}
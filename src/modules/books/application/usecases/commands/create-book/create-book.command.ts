import { Command } from "@nestjs/cqrs";
import { CreateBookResult } from "./create-book.result";
import { CreateBookRequestBody } from "@/modules/books/presentation/contracts/requests/create-book.request";
import { UserEntity } from "@/modules/users/domain/entities/user.entity";

export class CreateBookCommand extends Command<CreateBookResult> {
    constructor(
        public readonly title: string,
        public readonly description: string,
        public readonly pages: number,
        public readonly price: string,
        public readonly stock: number,
        public readonly isbn: string,
        public readonly categoryIds: string[],
        public readonly authorId: string,
    ) {
        super()
    }

    public static from(body: CreateBookRequestBody, currentUser: UserEntity) {
        return new CreateBookCommand(
            body.title,
            body.description,
            body.pages,
            body.price,
            body.stock,
            body.isbn,
            body.categoryIds,
            currentUser.id
        );
    }
}
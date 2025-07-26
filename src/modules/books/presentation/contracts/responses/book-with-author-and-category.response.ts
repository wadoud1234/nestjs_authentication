import { BookEntity } from "@/modules/books/domain/entities/book.entity";
import { CategoryResponsePayload } from "@/modules/categories/presentation/contracts/responses/category.response";
import { AuthorResponsePaylod } from "@/modules/users/presentation/contracts/responses/author.response";

export class BookWithAuthorAndCategoryResponsePayload extends BookEntity {
    author: AuthorResponsePaylod
    categories: CategoryResponsePayload[]
}
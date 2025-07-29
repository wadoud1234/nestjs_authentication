import { BookEntity } from "@/modules/books/domain/entities/book.entity";
import { CategoryResponsePayload } from "@/modules/categories/presentation/contracts/responses/category.response";
import { AuthorDetails } from "@/modules/users/presentation/contracts/responses/author.response";

export class BookWithAuthorAndCategoryResponsePayload extends BookEntity {
    author: AuthorDetails
    categories: CategoryResponsePayload[]
}

export class BookWithAuthorAndCategoryAndOptionalWishlistResponsePayload extends BookWithAuthorAndCategoryResponsePayload {
    wishlisted: boolean
    wishlistIte?: string
}
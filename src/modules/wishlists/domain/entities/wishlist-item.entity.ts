import { BookEntity } from "@/modules/books/domain/entities/book.entity"
import { AuthorDetails } from "@/modules/users/presentation/contracts/responses/author.response"

export class WishlistItemEntity {
    id: string
    userId: string
    bookId: string
    author: AuthorDetails
    book: BookEntity
    addedAt: Date
}
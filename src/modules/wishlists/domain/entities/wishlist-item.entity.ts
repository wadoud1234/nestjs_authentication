import { BookEntity } from "@/modules/books/domain/entities/book.entity"
import { AuthorResponsePaylod } from "@/modules/users/presentation/contracts/responses/author.response"

export class WishlistItemEntity {
    id: string
    userId: string
    bookId: string
    author: AuthorResponsePaylod
    book: BookEntity
    addedAt: Date
}
import { BookDetails } from "@/modules/books/presentation/contracts/responses/book-details.response"

export class WishlistItemResponse {
    addedAt: Date
    book: BookDetails
}
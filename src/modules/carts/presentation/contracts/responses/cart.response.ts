import { BookDetails } from "@/modules/books/presentation/contracts/responses/book-details.response"

export class CartResponsePayload {
    id: string
    items: CartItemResponsePayload[]
}

export class CartItemResponsePayload {
    id: string
    quantity: number
    addedAt: Date
    priceAtAdd: string

    cartId?: string

    bookId?: string
    book?: BookDetails
}

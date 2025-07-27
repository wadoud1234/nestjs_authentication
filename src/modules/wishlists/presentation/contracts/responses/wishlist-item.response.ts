import { AuthorResponsePaylod } from "@/modules/users/presentation/contracts/responses/author.response"

export class WishlistItemResponse {
    addedAt: Date
    book: {
        id: string,
        title: string,
        slug: string,
        description: string,
        price: string,
        stock: number,
        pages: number,
        rating: string,
        isbn: string,
        isPublished: boolean,
        author: AuthorResponsePaylod
    }
}
export class ReviewEntity {
    id: string
    rating: number
    title: string
    comment: string
    bookId: string
    authorId: string
    createdAt: Date
    updatedAt: Date | null
    deletedAt?: Date | null
}
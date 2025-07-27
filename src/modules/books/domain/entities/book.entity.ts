export class BookEntity {
    id: string  // auto generated
    title: string
    slug: string    // auto generated
    description: string
    pages: number
    price: string
    stock: number
    authorId: string    // auto connect
    rating: string  // default: 0
    isbn: string
    isPublished: boolean    // default: false
    createdAt: Date     // default: now
    updatedAt: Date | null  // default: null
    deletedAt: Date | null  // default: null
}
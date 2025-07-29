export const bookDetailsWithoutTimestampsColumns = () => ({
    id: true,
    title: true,
    slug: true,
    description: true,
    price: true,
    pages: true,
    stock: true,
    rating: true,
    ratingsCount: true,
    isbn: true,
    isPublished: true,
} as const)

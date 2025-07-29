import { Database, InjectDatabase } from "@/shared/infrastructure/database/database.module";
import { BooksTable, booksTable } from "@/shared/infrastructure/database/schema/books/books.table";
import { ConflictException, Inject, Injectable, Provider } from "@nestjs/common";
import { and, eq, ExtractRelationsFromTableExtraConfigSchema, ExtractTableRelationsFromSchema, SQL } from "drizzle-orm";
import { BookEntity } from "../../domain/entities/book.entity";
import { BookCategoryEntity } from "../../domain/entities/book-category.entity";
import { AuthorDetails } from "@/modules/users/presentation/contracts/responses/author.response";
import { CategoryResponsePayload } from "@/modules/categories/presentation/contracts/responses/category.response";
import { categoriesTable } from "@/shared/infrastructure/database/schema/books/categories.table";
import { CategoryNotFoundException } from "@/modules/categories/domain/exceptions/category-not-found.exception";
import { DatabaseTransaction } from "@/shared/infrastructure/database/providers/transaction-manager.provider";
import { bookCategoriesTable } from "@/shared/infrastructure/database/schema/books";

export interface BooksRepository {
    findFullBookWithCategoryJoinRelations(bookId: string, tx: DatabaseTransaction): Promise<(BookEntity & { categories: BookCategoryEntity[] }) | null>
    findFullBookWithCategoryJoinRelations(bookId: string, tx: void): Promise<(BookEntity & { categories: BookCategoryEntity[] }) | null>

    updateFullBook(
        bookId: string,
        input: Omit<BookEntity, "id" | "authorId" | "deletedAt" | "createdAt" | "updatedAt" | "rating">,
        tx: DatabaseTransaction,
    ): Promise<{ id: string }>
    updateFullBook(
        bookId: string,
        input: Omit<BookEntity, "id" | "authorId" | "deletedAt" | "createdAt" | "updatedAt" | "rating">,
        tx: void,
    ): Promise<{ id: string }>

    findBookByWhereWithAuthorAndCategories(where: SQL, tx: DatabaseTransaction)
        : Promise<(BookEntity & { author: AuthorDetails, categories: CategoryResponsePayload[] }) | null>
    findBookByWhereWithAuthorAndCategories(where: SQL, tx: void)
        : Promise<(BookEntity & { author: AuthorDetails, categories: CategoryResponsePayload[] }) | null>

    deleteOldBookCategoryRelations(oldRelationIds: string[], tx: DatabaseTransaction): Promise<void>
    deleteOldBookCategoryRelations(oldRelationIds: string[], tx: void): Promise<void>

    saveNewBookCategoryRelations(bookId: string, newCategoryIds: string[], tx: DatabaseTransaction): Promise<void>
    saveNewBookCategoryRelations(bookId: string, newCategoryIds: string[], tx: void): Promise<void>

    isBookExistByWhere(where: SQL, tx: DatabaseTransaction): Promise<false | { id: string }>
    isBookExistByWhere(where: SQL, tx: void): Promise<false | { id: string }>

    updateBookIsPublished(
        bookId: string,
        isPublished: boolean
    ): Promise<{ isPublished: boolean }>

    updateBookRating(bookId: string, ratingsAvg: string, ratingsCount: number, tx: DatabaseTransaction): Promise<{ rating: string; ratingsCount: number; }>
    updateBookRating(bookId: string, ratingsAvg: string, ratingsCount: number, tx: void): Promise<{ rating: string; ratingsCount: number; }>

    findById(bookId: string): Promise<{
        id: string;
        title: string;
        authorId: string;
        isPublished: boolean;
    } | null>

    isBookSlugUsed(slug: string, tx: DatabaseTransaction): Promise<boolean>
    isBookSlugUsed(slug: string, tx: void): Promise<boolean>

    create(input: CreateBookInput, tx: void): Promise<{ id: string; }>
    create(input: CreateBookInput, tx: DatabaseTransaction): Promise<{ id: string; }>
}

@Injectable()
export class BooksRepositoryImpl implements BooksRepository {
    constructor(
        @InjectDatabase() private readonly database: Database
    ) { }

    async create(input: CreateBookInput, tx: DatabaseTransaction | void): Promise<{ id: string; }> {
        return (tx || this.database)
            .insert(booksTable)
            .values({
                title: input.title,
                slug: input.slug,
                description: input.description,
                price: input.price,
                pages: input.pages,
                stock: input.stock,
                authorId: input.authorId,
                isbn: input.isbn
            })
            .returning({ id: booksTable.id })
            .then(r => r?.[0])
    }

    async isBookSlugUsed(slug: string, tx: DatabaseTransaction | void): Promise<boolean> {
        const book = await (tx || this.database).query.booksTable.findFirst({
            where: eq(booksTable.slug, slug),
            columns: {
                id: true,
                slug: true
            }
        })
        if (!book || !book.id) return false
        return true
    }

    async updateBookIsPublished(bookId: string, isPublished: boolean) {
        const [result] = await this.database
            .update(booksTable)
            .set({ isPublished })
            .where(eq(booksTable.id, bookId))
            .returning({ isPublished: booksTable.isPublished })
        return result
    }

    async isBookExistByWhere(where: SQL, tx: DatabaseTransaction | void) {
        const book = (await (tx || this.database).query.booksTable.findFirst({
            where,
            columns: { id: true }
        }))
        if (!book) return false

        return book;
    }

    async findFullBookWithCategoryJoinRelations(bookId: string, tx: DatabaseTransaction | void) {
        const book = await (tx || this.database).query.booksTable.findFirst({
            where: eq(booksTable.id, bookId),
            with: {
                categories: {
                    with: {
                        category: {
                            columns: {
                                id: true,
                                name: true
                            }
                        }
                    }
                }
            },
        })

        if (!book || !book.id) {
            return null
        }
        return book
    }

    async updateFullBook(
        bookId: string,
        input: Omit<BookEntity, "id" | "authorId" | "deletedAt" | "createdAt" | "updatedAt" | "rating">,
        tx: DatabaseTransaction | void,
    ) {
        return await (tx || this.database)
            .update(booksTable)
            .set({
                title: input.title,
                slug: input.slug,
                description: input.description,
                pages: input.pages,
                price: input.price,
                stock: input.stock,
                isbn: input.isbn,
                isPublished: input.isPublished,
                updatedAt: new Date(),
            })
            .where(eq(booksTable.id, bookId))
            .returning({ id: booksTable.id })
            .then(r => r?.[0])
    }

    async findBookByWhereWithAuthorAndCategories(where: SQL, tx: DatabaseTransaction | void) {
        const book = await (tx || this.database).query.booksTable.findFirst({
            where: and(where),
            with: {
                author: {
                    columns: {
                        id: true,
                        name: true
                    }
                },
                categories: {
                    with: {
                        category: {
                            columns: {
                                id: true,
                                name: true
                            }
                        }
                    }
                },
            }
        })

        if (!book || !book.id) {
            return null
        }

        const formattedBook = {
            ...book,
            categories: book.categories.map(category => category.category)
        }

        return formattedBook;
    }

    async deleteOldBookCategoryRelations(oldRelationIds: string[], tx: DatabaseTransaction | void) {
        await Promise.all(
            oldRelationIds.map(async (relationId) => await (tx || this.database).delete(bookCategoriesTable)
                .where(eq(bookCategoriesTable.categoryId, relationId))
                .catch(() => { throw new ConflictException("Exception happen when trying to delete old book categories") })
            )
        )
    }

    async saveNewBookCategoryRelations(bookId: string, newCategoryIds: string[], tx: DatabaseTransaction | void) {
        await Promise.all(
            newCategoryIds.map(async categoryId => {
                await (tx || this.database).insert(bookCategoriesTable)
                    .values({
                        categoryId,
                        bookId
                    })
            })
        )
    }

    async updateBookRating(bookId: string, ratingsAvg: string, ratingsCount: number, tx: DatabaseTransaction | void) {
        // Update the book with new average and count
        return await (tx || this.database)
            .update(booksTable)
            .set({
                rating: ratingsAvg,
                ratingsCount: ratingsCount,
                updatedAt: new Date()
            })
            .where(eq(booksTable.id, bookId))
            .returning({
                rating: booksTable.rating,
                ratingsCount: booksTable.ratingsCount
            }).then(r => r?.[0])
    }

    async findById(bookId: string): Promise<{
        id: string;
        title: string;
        authorId: string;
        isPublished: boolean;
    } | null> {
        const book = await this.database.query.booksTable.findFirst({
            where: eq(booksTable.id, bookId),
            columns: {
                id: true,
                title: true,
                isPublished: true,
                authorId: true
            }
        })
        if (!book) {
            return null;
        }
        return book
    }

}

export const BooksRepositoryToken = Symbol("BooksRepository")

export const InjectBooksRepository = () => Inject(BooksRepositoryToken)

export const BooksRepositoryProvider: Provider = {
    provide: BooksRepositoryToken,
    useClass: BooksRepositoryImpl
}

export interface CreateBookInput {
    title: string,
    description: string,
    slug: string,
    price: string,
    pages: number,
    stock: number,
    isbn: string,
    authorId: string,
}
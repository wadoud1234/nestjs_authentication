import { Database, InjectDatabase } from "@/shared/infrastructure/database/database.module";
import { BooksTable, booksTable } from "@/shared/infrastructure/database/schema/books.table";
import { ConflictException, Inject, Injectable, Provider } from "@nestjs/common";
import { and, eq, ExtractRelationsFromTableExtraConfigSchema, ExtractTableRelationsFromSchema, SQL } from "drizzle-orm";
import { BookEntity } from "../../domain/entities/book.entity";
import { BookCategoryEntity } from "../../domain/entities/book-category.entity";
import { AuthorDetails } from "@/modules/users/presentation/contracts/responses/author.response";
import { CategoryResponsePayload } from "@/modules/categories/presentation/contracts/responses/category.response";
import { categoriesTable } from "@/shared/infrastructure/database/schema/categories.table";
import { CategoryNotFoundException } from "@/modules/categories/domain/exceptions/category-not-found.exception";
import { bookCategoriesTable } from "@/shared/infrastructure/database/schema/books_categories.table";
import { DatabaseTransaction } from "@/shared/infrastructure/database/providers/transaction-manager.provider";
import { AnyPgColumn, PgColumn, PgTableExtraConfig, PgTableWithColumns } from "drizzle-orm/pg-core";
import schema from "@/shared/infrastructure/database/schema";

export interface BooksRepository {
    findFullBookWithCategoryJoinRelations(
        tx: DatabaseTransaction | Database,
        bookId: string
    ): Promise<(BookEntity & { categories: BookCategoryEntity[] }) | null>

    verifySlugUsed(slug: string): Promise<boolean>

    updateFullBook(
        tx: DatabaseTransaction,
        bookId: string,
        input: Omit<BookEntity, "id" | "authorId" | "deletedAt" | "createdAt" | "updatedAt" | "rating">
    ): Promise<{ id: string }>

    findBookByWhereWithAuthorAndCategories(where: SQL): Promise<(BookEntity & { author: AuthorDetails, categories: CategoryResponsePayload[] }) | null>

    getBookCategories(categoryIds: string[]): Promise<CategoryResponsePayload[]>

    deleteOldBookCategoryRelations(
        db: DatabaseTransaction,
        oldRelationIds: string[]
    ): Promise<void>

    saveNewBookCategoryRelations(
        tx: DatabaseTransaction,
        bookId: string,
        newCategoryIds: string[]
    ): Promise<void>

    isBookExistByWhere(where: SQL, tx: DatabaseTransaction): Promise<false | { id: string }>
    isBookExistByWhere(where: SQL, tx: void): Promise<false | { id: string }>

    updateBookIsPublished(
        bookId: string,
        isPublished: boolean
    ): Promise<{ isPublished: boolean }>

    updateBookRating(bookId: string, ratingsAvg: string, ratingsCount: number, tx: DatabaseTransaction): Promise<{ rating: string; ratingsCount: number; }>
    updateBookRating(bookId: string, ratingsAvg: string, ratingsCount: number, tx: void): Promise<{ rating: string; ratingsCount: number; }>
}

@Injectable()
export class BooksRepositoryImpl implements BooksRepository {
    constructor(
        @InjectDatabase() private readonly database: Database
    ) { }

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

    async findFullBookWithCategoryJoinRelations(tx: DatabaseTransaction | Database, bookId: string) {
        const book = await tx.query.booksTable.findFirst({
            where: eq(booksTable.id, bookId),
            with: {
                categories: true
            },
        })

        if (!book || !book.id) {
            return null
        }
        return book
    }

    async verifySlugUsed(slug: string) {
        const [isSlugUsedBefore] = await this.database
            .select({
                id: booksTable.id,
                slug: booksTable.slug
            })
            .from(booksTable)
            .where(eq(booksTable.slug, slug))

        if (!isSlugUsedBefore) {
            return false
        }
        return true
    }

    async updateFullBook(
        tx: DatabaseTransaction,
        bookId: string,
        input: Omit<BookEntity, "id" | "authorId" | "deletedAt" | "createdAt" | "updatedAt" | "rating">
    ) {
        const [updatedBook] = await tx
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
        return updatedBook
    }

    async findBookByWhereWithAuthorAndCategories(where: SQL) {
        const book = await this.database.query.booksTable.findFirst({
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

    async getBookCategories(categoryIds: string[]) {
        return await Promise.all(categoryIds.map(async (categoryId) => {
            const [category] = await this.database
                .select({
                    id: categoriesTable.id,
                    name: categoriesTable.name
                })
                .from(categoriesTable)
                .where(eq(categoriesTable.id, categoryId))
                .limit(1)
                .catch(() => {
                    throw new CategoryNotFoundException(`Category with id=${categoryId} not found`)
                })
            return category
        }))
    }

    async deleteOldBookCategoryRelations(
        tx: DatabaseTransaction,
        oldRelationIds: string[]
    ) {
        await Promise.all(oldRelationIds.map(async (relationId) => await tx.delete(bookCategoriesTable)
            .where(eq(bookCategoriesTable.categoryId, relationId))
            .catch(() => { throw new ConflictException("Exception happen when trying to delete old book categories") })
        ))
    }

    async saveNewBookCategoryRelations(tx: DatabaseTransaction, bookId: string, newCategoryIds: string[]) {
        await Promise.all(newCategoryIds.map(async categoryId => {
            await tx.insert(bookCategoriesTable)
                .values({
                    categoryId,
                    bookId
                })
        }))
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

}

export const BooksRepositoryToken = Symbol("BooksRepository")

export const InjectBooksRepository = () => Inject(BooksRepositoryToken)

export const BooksRepositoryProvider: Provider = {
    provide: BooksRepositoryToken,
    useClass: BooksRepositoryImpl
}
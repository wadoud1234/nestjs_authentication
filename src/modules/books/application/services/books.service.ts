import { Database, InjectDatabase } from "@/shared/infrastructure/database/database.module";
import { booksTable, CreateBookTable } from "@/shared/infrastructure/database/schema/books.table";
import { ConflictException, Inject, Injectable, Provider } from "@nestjs/common";
import { and, eq, SQL } from "drizzle-orm";
import { BookEntity } from "../../domain/entities/book.entity";
import { BookCategoryEntity } from "../../domain/entities/book-category.entity";
import { AuthorResponsePaylod } from "@/modules/users/presentation/contracts/responses/author.response";
import { CategoryResponsePayload } from "@/modules/categories/presentation/contracts/responses/category.response";
import { categoriesTable } from "@/shared/infrastructure/database/schema/categories.table";
import { CategoryNotFoundException } from "@/modules/categories/domain/exceptions/category-not-found.exception";
import { bookCategoriesTable } from "@/shared/infrastructure/database/schema/books_categories.table";

export interface BooksService {
    findFullBookWithCategoryJoinRelations(bookId: string): Promise<(BookEntity & { categories: BookCategoryEntity[] }) | null>
    verifySlugUsed(slug: string): Promise<boolean>
    updateFullBook(input: Omit<BookEntity, "id" | "authorId" | "deletedAt" | "createdAt" | "updatedAt" | "rating">): Promise<{ id: string }>
    findBookByWhereWithAuthorAndCategories(where: SQL): Promise<(BookEntity & { author: AuthorResponsePaylod, categories: CategoryResponsePayload[] }) | null>
    getBookCategories(categoryIds: string[]): Promise<CategoryResponsePayload[]>
    deleteOldBookCategoryRelations(oldRelationIds: string[]): Promise<void>
    saveNewBookCategoryRelations(bookId: string, newCategoryIds: string[]): Promise<void>
    isBookExistByWhere(where: SQL): Promise<boolean>
    updateBookIsPublished(bookId: string, isPublished: boolean): Promise<{ isPublished: boolean }>
}

@Injectable()
export class BooksServiceImpl implements BooksService {
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

    async isBookExistByWhere(where: SQL) {
        const isBookExist = await this.database.query.booksTable.findFirst({
            where,
            columns: {
                id: true
            }
        })
        if (!isBookExist) return false
        return true
    }

    async findFullBookWithCategoryJoinRelations(bookId: string) {
        const book = await this.database.query.booksTable.findFirst({
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

    async updateFullBook(input: Omit<BookEntity, "id" | "authorId" | "deletedAt" | "createdAt" | "updatedAt" | "rating">) {
        const [updatedBook] = await this.database
            .update(booksTable)
            .set({
                title: input.title,
                slug: input.slug,
                description: input.description,
                pages: input.pages,
                stock: input.stock,
                isbn: input.isbn,
                isPublished: input.isPublished,
                updatedAt: new Date(),
            })
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

    async deleteOldBookCategoryRelations(oldRelationIds: string[]) {
        await Promise.all(oldRelationIds.map(async (relationId) => await this.database
            .delete(bookCategoriesTable)
            .where(eq(bookCategoriesTable.categoryId, relationId))
            .catch(() => { throw new ConflictException("Exception happen when trying to delete old book categories") })
        ))
    }

    async saveNewBookCategoryRelations(bookId: string, newCategoryIds: string[]) {
        await Promise.all(newCategoryIds.map(async categoryId => {
            await this.database.insert(bookCategoriesTable)
                .values({
                    categoryId,
                    bookId
                })
        }))
    }
}

export const BooksServiceToken = Symbol("BooksService")

export const InjectBooksService = () => Inject(BooksServiceToken)

export const BooksServiceProvider: Provider = {
    provide: BooksServiceToken,
    useClass: BooksServiceImpl
}
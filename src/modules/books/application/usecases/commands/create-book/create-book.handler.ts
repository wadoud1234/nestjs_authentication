import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateBookCommand } from "./create-book.command";
import { CreateBookResult } from "./create-book.result";
import { ConflictException, Provider } from "@nestjs/common";
import { Database, InjectDatabase } from "@/shared/infrastructure/database/database.module";
import { booksTable } from "@/shared/infrastructure/database/schema/books.table";
import { InjectSlugGenerator, SlugGeneratorService } from "../../../services/slug-generator.service";
import { eq } from "drizzle-orm";
import { categoriesTable } from "@/shared/infrastructure/database/schema/categories.table";
import { bookCategoriesTable } from "@/shared/infrastructure/database/schema/books_categories.table";
import { CategoryNotFoundException } from "@/modules/categories/domain/exceptions/category-not-found.exception";

export interface CreateBookCommandHandler extends ICommandHandler<CreateBookCommand> { }

@CommandHandler(CreateBookCommand)
export class CreateBookCommandHandlerImpl implements CreateBookCommandHandler {
    constructor(
        @InjectDatabase() private readonly database: Database,
        @InjectSlugGenerator() private readonly slugGenerator: SlugGeneratorService
    ) { }

    async execute({ title, description, pages, stock, isbn, authorId, categoryIds }: CreateBookCommand): Promise<CreateBookResult> {
        // Verify that book doesnt exist with same title
        const [isBookExist] = await this.database
            .select({ id: booksTable.id, title: booksTable.title })
            .from(booksTable)
            .where(eq(booksTable.title, title))
            .limit(1)

        if (isBookExist && isBookExist?.id && isBookExist?.title) {
            throw new ConflictException("Book title already used, try to change it !")
        }

        let generatedSlug = this.slugGenerator.generate(title);

        // Verify that slug wasnot used before
        const [isSlugUsedBefore] = await this.database
            .select({
                id: booksTable.id,
                slug: booksTable.slug
            })
            .from(booksTable)
            .where(eq(booksTable.slug, generatedSlug))

        if (isSlugUsedBefore && isSlugUsedBefore.id) {
            generatedSlug = generatedSlug + new Date().toISOString()
        }

        if (!Array.isArray(categoryIds) || categoryIds.length <= 0) {
            throw new ConflictException("Category IDs must not be empty")
        }

        const categories = await Promise.all(categoryIds.map(async (categoryId) => {
            const [category] = await this.database
                .select({
                    id: categoriesTable.id,
                    name: categoriesTable.name
                })
                .from(categoriesTable)
                .where(eq(categoriesTable.id, categoryId))
                .limit(1)
                .catch(() => {
                    throw new CategoryNotFoundException(`Category with id=${categoryId} not exist`)
                })

            return category;
        }))


        const [newBook] = await this.database
            .insert(booksTable)
            .values({
                title,
                description,
                slug: generatedSlug,
                pages,
                stock,
                isbn,
                authorId,
            })
            .returning({ id: booksTable.id })


        await Promise.all(categories.map(async (category) => {
            const book_category = await this.database.insert(bookCategoriesTable).values({
                bookId: newBook.id,
                categoryId: category.id
            })
        }))

        const book = await this.database.query.booksTable.findFirst({
            where: eq(booksTable.id, newBook.id),
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


        if (!book) throw new ConflictException("I am sure there is a problem because generated book not found")

        const formattedBook = {
            ...book,
            categories: book.categories.map(category => category.category)
        }

        return formattedBook
    }
}

export const CreateBookCommandHandlerToken = Symbol("CreateBookCommandHandler")

export const CreateBookCommandHandlerProvider: Provider = {
    provide: CreateBookCommandHandlerToken,
    useClass: CreateBookCommandHandlerImpl
}
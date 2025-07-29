import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UpdateBookCommand } from "./update-book.command";
import { UpdateBookCommandResult } from "./update-book.result";
import { ConflictException, Provider, UnauthorizedException } from "@nestjs/common";
import { booksTable } from "@/shared/infrastructure/database/schema/books/books.table";
import { eq } from "drizzle-orm";
import { BookNotFoundException } from "@/modules/books/domain/exceptions/book-not-found.exception";
import { InjectSlugGenerator, SlugGeneratorService } from "../../../services/slug-generator.service";
import { BooksRepository, InjectBooksRepository } from "../../../../infrastructure/repositories/books.repository";
import { Database, InjectDatabase } from "@/shared/infrastructure/database/database.module";
import { BooksPolicyService, InjectBooksPolicy } from "../../../services/books-policy.service";
import { CategoriesRepository, InjectCategoriesRepository } from "@/modules/categories/infrastructure/repositories/categories.repository";
import { categoriesTable } from "@/shared/infrastructure/database/schema/books";
import { CategoryNotFoundException } from "@/modules/categories/domain/exceptions/category-not-found.exception";

export interface UpdateBookCommandHandler extends ICommandHandler<UpdateBookCommand> { }

@CommandHandler(UpdateBookCommand)
export class UpdateBookCommandHandlerImpl implements UpdateBookCommandHandler {
    constructor(
        @InjectDatabase() private readonly database: Database,
        @InjectBooksRepository() private readonly booksRepository: BooksRepository,
        @InjectSlugGenerator() private readonly slugGenerator: SlugGeneratorService,
        @InjectBooksPolicy() private readonly bookPolicy: BooksPolicyService,
    ) { }

    async execute({ bookId, categoryIds, description, isPublished, isbn, pages, stock, title, price, currentUser }: UpdateBookCommand): Promise<UpdateBookCommandResult> {
        const updatedBook = await this.database.transaction(async (tx) => {

            const oldBook = await this.booksRepository.findFullBookWithCategoryJoinRelations(bookId, tx)

            // Verify book exist
            if (!oldBook) {
                throw new BookNotFoundException()
            }

            // Authorize User
            if (!this.bookPolicy.canEdit(currentUser, oldBook)) {
                throw new UnauthorizedException('You dont have permission to edit this book');
            }

            let generatedSlug: string;

            // if title not changes so no need to update
            if (oldBook.title === title) {
                generatedSlug = oldBook.slug
            }
            else {
                generatedSlug = this.slugGenerator.generate(title);
                const isSlugUsed = await this.booksRepository.isBookSlugUsed(generatedSlug, tx);

                if (isSlugUsed) {
                    generatedSlug = generatedSlug + new Date().toISOString()
                }
            }

            const oldCategoryIds = oldBook.categories.map(category => {
                return category.categoryId
            })

            await this.booksRepository.deleteOldBookCategoryRelations(oldCategoryIds, tx);

            const categories = await Promise.all(
                categoryIds.map(async (categoryId) => {
                    const category = await tx.query.categoriesTable.findFirst({
                        where: eq(categoriesTable.id, categoryId),
                        columns: {
                            id: true,
                            name: true
                        }
                    })

                    if (!category) throw new CategoryNotFoundException(`Category with id=${categoryId} not found !`)

                    return category
                }))

            await this.booksRepository.updateFullBook(
                bookId,
                {
                    title,
                    slug: generatedSlug,
                    description,
                    pages,
                    price,
                    stock,
                    isbn,
                    isPublished,
                },
                tx
            )

            await this.booksRepository.saveNewBookCategoryRelations(bookId, categories.map(category => category.id), tx);

            const book = await this.booksRepository.findBookByWhereWithAuthorAndCategories(eq(booksTable.id, bookId), tx);

            if (!book) throw new ConflictException("I am sure there is a problem because generated book not found")
            return book
        })

        return updatedBook;
    }

}

export const UpdateBookCommandHandlerToken = Symbol("UpdateBookCommandHandler")

export const UpdateBookCommandHandlerProvider: Provider = {
    provide: UpdateBookCommandHandlerToken,
    useClass: UpdateBookCommandHandlerImpl
}
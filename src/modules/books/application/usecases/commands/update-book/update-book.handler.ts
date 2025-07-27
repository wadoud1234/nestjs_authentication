import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UpdateBookCommand } from "./update-book.command";
import { UpdateBookCommandResult } from "./update-book.result";
import { ConflictException, Provider } from "@nestjs/common";
import { booksTable } from "@/shared/infrastructure/database/schema/books.table";
import { eq } from "drizzle-orm";
import { BookNotFoundException } from "@/modules/books/domain/exceptions/book-not-found.exception";
import { InjectSlugGenerator, SlugGeneratorService } from "../../../services/slug-generator.service";
import { BooksRepository, InjectBooksRepository } from "../../../../infrastructure/repositories/books.repository";
import { Database, InjectDatabase } from "@/shared/infrastructure/database/database.module";

export interface UpdateBookCommandHandler extends ICommandHandler<UpdateBookCommand> { }

@CommandHandler(UpdateBookCommand)
export class UpdateBookCommandHandlerImpl implements UpdateBookCommandHandler {
    constructor(
        @InjectDatabase() private readonly database: Database,
        @InjectBooksRepository() private readonly booksRepository: BooksRepository,
        @InjectSlugGenerator() private readonly slugGenerator: SlugGeneratorService
    ) { }

    async execute({ authorId, bookId, categoryIds, description, isPublished, isbn, pages, stock, title, price }: UpdateBookCommand): Promise<UpdateBookCommandResult> {
        await this.database.transaction(async (tx) => {
            const oldBook = await this.booksRepository.findFullBookWithCategoryJoinRelations(tx, bookId)

            if (!oldBook) {
                throw new BookNotFoundException()
            }

            let generatedSlug: string;
            // if title not changes so no need to update
            if (oldBook.title === title) {
                generatedSlug = oldBook.slug
            } else {
                generatedSlug = this.slugGenerator.generate(title);
                const isSlugUsed = await this.booksRepository.verifySlugUsed(generatedSlug);
                if (isSlugUsed) {
                    generatedSlug = generatedSlug + new Date().toISOString()
                }
            }

            const oldCategoryIds = oldBook.categories.map(category => {
                return category.categoryId
            })

            await this.booksRepository.deleteOldBookCategoryRelations(tx, oldCategoryIds);

            const categories = await this.booksRepository.getBookCategories(Array.from(categoryIds));;

            await this.booksRepository.updateFullBook(
                tx,
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
                })

            await this.booksRepository.saveNewBookCategoryRelations(tx, bookId, categories.map(category => category.id));

        })

        const book = await this.booksRepository.findBookByWhereWithAuthorAndCategories(eq(booksTable.id, bookId))

        if (!book) throw new ConflictException("I am sure there is a problem because generated book not found")

        return book;
    }

}

export const UpdateBookCommandHandlerToken = Symbol("UpdateBookCommandHandler")

export const UpdateBookCommandHandlerProvider: Provider = {
    provide: UpdateBookCommandHandlerToken,
    useClass: UpdateBookCommandHandlerImpl
}
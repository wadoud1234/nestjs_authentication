import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UpdateBookCommand } from "./update-book.command";
import { UpdateBookCommandResult } from "./update-book.result";
import { ConflictException, Provider } from "@nestjs/common";
import { booksTable } from "@/shared/infrastructure/database/schema/books.table";
import { eq } from "drizzle-orm";
import { BookNotFoundException } from "@/modules/books/domain/exceptions/book-not-found.exception";
import { InjectSlugGenerator, SlugGeneratorService } from "../../../services/slug-generator.service";
import { BooksService, InjectBooksService } from "../../../services/books.service";

export interface UpdateBookCommandHandler extends ICommandHandler<UpdateBookCommand> { }

@CommandHandler(UpdateBookCommand)
export class UpdateBookCommandHandlerImpl implements UpdateBookCommandHandler {
    constructor(
        @InjectBooksService() private readonly booksService: BooksService,
        @InjectSlugGenerator() private readonly slugGenerator: SlugGeneratorService
    ) { }

    async execute({ authorId, bookId, categoryIds, description, isPublished, isbn, pages, stock, title }: UpdateBookCommand): Promise<UpdateBookCommandResult> {
        const oldBook = await this.booksService.findFullBookWithCategoryJoinRelations(bookId)

        if (!oldBook) {
            throw new BookNotFoundException()
        }

        let generatedSlug: string;

        // if title not changes so no need to update
        if (oldBook.title === title) {
            generatedSlug = oldBook.slug
        }
        else {
            generatedSlug = this.slugGenerator.generate(title);
            const isSlugUsed = await this.booksService.verifySlugUsed(generatedSlug);
            if (isSlugUsed) {
                generatedSlug = generatedSlug + new Date().toISOString()
            }
        }

        const oldCategoryIds = oldBook.categories.map(category => {
            return category.categoryId
        })

        await this.booksService.deleteOldBookCategoryRelations(oldCategoryIds);

        const categories = await this.booksService.getBookCategories(Array.from(categoryIds));;

        await this.booksService.updateFullBook({
            title,
            slug: generatedSlug,
            description,
            pages,
            stock,
            isbn,
            isPublished,
        })

        await this.booksService.saveNewBookCategoryRelations(bookId, categories.map(category => category.id));

        const book = await this.booksService.findBookByWhereWithAuthorAndCategories(eq(booksTable.id, bookId))

        if (!book) throw new ConflictException("I am sure there is a problem because generated book not found")

        return book;
    }

}

export const UpdateBookCommandHandlerToken = Symbol("UpdateBookCommandHandler")

export const UpdateBookCommandHandlerProvider: Provider = {
    provide: UpdateBookCommandHandlerToken,
    useClass: UpdateBookCommandHandlerImpl
}
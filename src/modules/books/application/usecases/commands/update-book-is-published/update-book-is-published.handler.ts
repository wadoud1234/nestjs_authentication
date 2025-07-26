import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Provider } from "@nestjs/common";
import { booksTable } from "@/shared/infrastructure/database/schema/books.table";
import { eq } from "drizzle-orm";
import { BookNotFoundException } from "@/modules/books/domain/exceptions/book-not-found.exception";
import { BooksService, InjectBooksService } from "../../../services/books.service";
import { UpdateBookIsPublishedCommand } from "./update-book-is-published.command";
import { UpdateBookIsPublishedCommandResult } from "./update-book-is-published.result";

export interface UpdateBookIsPublishedCommandHandler extends ICommandHandler<UpdateBookIsPublishedCommand> { }

@CommandHandler(UpdateBookIsPublishedCommand)
export class UpdateBookIsPublishedCommandHandlerImpl implements UpdateBookIsPublishedCommandHandler {
    constructor(
        @InjectBooksService() private readonly booksService: BooksService,
    ) { }

    async execute({ id, isPublished }: UpdateBookIsPublishedCommand): Promise<UpdateBookIsPublishedCommandResult> {
        const isBookExist = await this.booksService.isBookExistByWhere(eq(booksTable.id, id));

        if (!isBookExist) {
            throw new BookNotFoundException()
        }

        return await this.booksService.updateBookIsPublished(id, isPublished)
    }

}

export const UpdateBookIsPublishedCommandHandlerToken = Symbol("UpdateBookIsPublishedCommandHandler")

export const UpdateBookIsPublishedCommandHandlerProvider: Provider = {
    provide: UpdateBookIsPublishedCommandHandlerToken,
    useClass: UpdateBookIsPublishedCommandHandlerImpl
}
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { DeleteBookCommand } from "./delete-book.command";
import { DeleteBookCommandResult } from "./delete-book.result";
import { ForbiddenException, Provider, UnauthorizedException } from "@nestjs/common";
import { Database, InjectDatabase } from "@/shared/infrastructure/database/database.module";
import { booksTable } from "@/shared/infrastructure/database/schema/books/books.table";
import { eq } from "drizzle-orm";
import { BooksRepository, InjectBooksRepository } from "@/modules/books/infrastructure/repositories/books.repository";
import { BooksPolicyService, InjectBooksPolicy } from "../../../services/books-policy.service";
import { BookNotFoundException } from "@/modules/books/domain/exceptions/book-not-found.exception";

export interface DeleteBookCommandHandler extends ICommandHandler<DeleteBookCommand> { }

@CommandHandler(DeleteBookCommand)
export class DeleteBookCommandHandlerImpl implements DeleteBookCommandHandler {
    constructor(
        @InjectDatabase() private readonly database: Database,
        @InjectBooksRepository() private readonly booksRepository: BooksRepository,
        @InjectBooksPolicy() private readonly bookPolicy: BooksPolicyService
    ) { }

    async execute({ bookId, currentUser }: DeleteBookCommand): Promise<DeleteBookCommandResult> {
        const book = await this.booksRepository.findById(bookId);
        if (!book) {
            throw new BookNotFoundException()
        }

        if (!this.bookPolicy.canDelete(currentUser, book)) {
            throw new UnauthorizedException('You cannot delete this book');
        }

        await this.database.delete(booksTable).where(eq(booksTable.id, bookId))
        return {}
    }
}

export const DeleteBookCommandHandlerToken = Symbol("DeleteBookCommandHandler")

export const DeleteBookCommandHandlerProvider: Provider = {
    provide: DeleteBookCommandHandlerToken,
    useClass: DeleteBookCommandHandlerImpl
}
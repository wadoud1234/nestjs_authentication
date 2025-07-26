import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { DeleteBookCommand } from "./delete-book.command";
import { DeleteBookCommandResult } from "./delete-book.result";
import { Provider } from "@nestjs/common";
import { Database, InjectDatabase } from "@/shared/infrastructure/database/database.module";
import { booksTable } from "@/shared/infrastructure/database/schema/books.table";
import { eq } from "drizzle-orm";

export interface DeleteBookCommandHandler extends ICommandHandler<DeleteBookCommand> { }

@CommandHandler(DeleteBookCommand)
export class DeleteBookCommandHandlerImpl implements DeleteBookCommandHandler {
    constructor(
        @InjectDatabase() private readonly database: Database
    ) { }

    async execute({ bookId }: DeleteBookCommand): Promise<DeleteBookCommandResult> {
        await this.database.delete(booksTable).where(eq(booksTable.id, bookId))
        return {}
    }
}

export const DeleteBookCommandHandlerToken = Symbol("DeleteBookCommandHandler")

export const DeleteBookCommandHandlerProvider: Provider = {
    provide: DeleteBookCommandHandlerToken,
    useClass: DeleteBookCommandHandlerImpl
}
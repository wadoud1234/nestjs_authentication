import { Command } from "@nestjs/cqrs";
import { DeleteBookCommandResult } from "./delete-book.result";

export class DeleteBookCommand extends Command<DeleteBookCommandResult> {
    constructor(
        public readonly bookId: string
    ) {
        super()
    }
}
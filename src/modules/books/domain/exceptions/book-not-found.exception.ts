import { ConflictException } from "@nestjs/common";

export class BookNotFoundException extends ConflictException {
    constructor(message: string = "Book not found") {
        super(message)
    }
}
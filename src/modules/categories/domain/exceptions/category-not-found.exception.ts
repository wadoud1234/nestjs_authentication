import { ConflictException } from "@nestjs/common";

export class CategoryNotFoundException extends ConflictException {
    constructor(message: string = "Category not found") {
        super(message)
    }
}
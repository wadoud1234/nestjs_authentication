import { ConflictException } from "@nestjs/common";

export class CategoryAlreadyExist extends ConflictException {
    constructor(message: string = "Category already exist") {
        super(message)
    }
}
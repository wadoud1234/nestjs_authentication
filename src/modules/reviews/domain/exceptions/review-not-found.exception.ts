import { ConflictException } from "@nestjs/common";

export class ReviewNotFoundException extends ConflictException {

    constructor(message: string = "Review not found") {
        super(message)
    }

}
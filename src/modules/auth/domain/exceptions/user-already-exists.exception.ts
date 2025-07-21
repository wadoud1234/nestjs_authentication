import { ConflictException } from "@nestjs/common";

export class EmailAlreadyUsed extends ConflictException {
    constructor(message: string = "Email already used") {
        super(message);
    }
}
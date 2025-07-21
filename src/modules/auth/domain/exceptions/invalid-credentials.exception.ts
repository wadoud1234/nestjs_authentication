import { BadRequestException } from "@nestjs/common";

export class InvalidCredentialsException extends BadRequestException {
    constructor(message: string = "Invalid Credentials") {
        super(message)
    }
}
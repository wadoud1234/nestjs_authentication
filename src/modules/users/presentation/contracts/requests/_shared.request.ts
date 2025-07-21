import { applyDecorators } from "@nestjs/common";
import { IsString, MaxLength, MinLength } from "class-validator";

export function isValidUsername() {
    return applyDecorators(
        IsString({ message: "Username is a string" }),
        MinLength(3, { message: "Username must be at least 3 characters" }),
        MaxLength(50, { message: "Username must be less than 50 characters" })
    )
}
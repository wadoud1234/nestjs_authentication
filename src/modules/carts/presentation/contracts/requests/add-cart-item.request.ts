import { IsInt, IsString, IsUUID, Min } from "class-validator";

export class AddCartItemRequestBody {
    @IsString()
    @IsUUID()
    bookId: string

    @IsInt()
    @Min(1, { message: "Quantity must be greater than 1" })
    quantity: number
}
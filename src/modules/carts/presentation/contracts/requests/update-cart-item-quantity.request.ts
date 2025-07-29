import { IsInt, IsString, IsUUID, Min } from "class-validator";

export class UpdateCartItemQuantityRequestBody {
    @IsInt()
    @Min(0, { message: "Item quantity must be greater than 1" })
    quantity: number
}

export class UpdateCartItemQuantityRequestParams {
    @IsString()
    @IsUUID()
    cartItemId: string
}
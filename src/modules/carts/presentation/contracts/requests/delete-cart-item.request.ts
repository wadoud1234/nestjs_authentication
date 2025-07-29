import { IsString, IsUUID } from "class-validator";

export class DeleteCartItemRequestParams {
    @IsString()
    @IsUUID()
    cartItemId: string
}
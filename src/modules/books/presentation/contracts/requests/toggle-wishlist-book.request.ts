import { IsString, IsUUID } from "class-validator";

export class ToggleWishlistBookRequestParams {
    @IsString()
    @IsUUID()
    id: string
}
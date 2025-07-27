import { IsString, IsUUID } from "class-validator";

export class DeleteWishlistRequestParams {
    @IsString()
    @IsUUID()
    id: string
}
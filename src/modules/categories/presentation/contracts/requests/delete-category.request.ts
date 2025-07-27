import { IsString, IsUUID } from "class-validator";

export class DeleteCategoryRequestParams {
    @IsUUID()
    @IsString()
    id: string
}
import { IsString, IsUUID } from "class-validator";

export class UpdateCategoryRequestBody {
    @IsString()
    name: string

    @IsString()
    description: string
}

export class UpdateCategoryRequestParams {
    @IsUUID()
    @IsString()
    id: string
}
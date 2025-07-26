import { IsString } from "class-validator";

export class CreateCategoryRequestBody {
    @IsString()
    name: string

    @IsString()
    description: string
}
import { IsArray, IsBoolean, IsInt, IsNotEmpty, IsString, IsUUID, } from "class-validator";

export class UpdateBookRequestBody {
    @IsString()
    title: string

    @IsString()
    description: string

    @IsInt()
    pages: number

    @IsInt()
    stock: number

    @IsString()
    isbn: string

    @IsBoolean()
    isPublished: boolean

    @IsArray()
    @IsNotEmpty({ each: true })
    @IsString({ each: true })
    categoryIds: string[]
}

export class UpdateBookRequestParams {
    @IsUUID()
    @IsString()
    id: string
}
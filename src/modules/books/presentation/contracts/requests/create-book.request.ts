import { IsArray, IsInt, IsNotEmpty, IsNotEmptyObject, IsString, } from "class-validator";

export class CreateBookRequestBody {
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

    @IsArray()
    @IsNotEmpty({ each: true })
    @IsString({ each: true })
    categoryIds: string[]
}
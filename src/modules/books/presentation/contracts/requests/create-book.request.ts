import { IsArray, IsInt, IsNotEmpty, IsNotEmptyObject, IsNumber, IsNumberString, IsString, } from "class-validator";

export class CreateBookRequestBody {
    @IsString()
    title: string

    @IsString()
    description: string

    @IsInt()
    pages: number

    @IsNumberString()
    price: string

    @IsInt()
    stock: number

    @IsString()
    isbn: string

    @IsArray()
    @IsNotEmpty({ each: true })
    @IsString({ each: true })
    categoryIds: string[]
}
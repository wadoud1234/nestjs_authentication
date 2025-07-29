import { IsString } from "class-validator";

export class DeleteBookRequestParams {
    @IsString()
    bookId: string
}
import { Type } from "class-transformer";
import { IsNumber, IsOptional, IsString, IsUUID, Min } from "class-validator";

export class GetBookReviewsRequestParams {
    @IsString()
    bookSlug: string
}

export class GetBookReviewsRequestQuery {
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1, { message: "Page must be at least 1" })
    page: number = 1

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1, { message: "Size must be at least 1" })
    size: number = 10
}
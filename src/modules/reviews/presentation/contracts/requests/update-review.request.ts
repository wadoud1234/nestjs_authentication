import { Type } from "class-transformer";
import { IsInt, IsOptional, IsString, IsStrongPassword, IsUUID, Max, MaxLength, Min } from "class-validator";

export class UpdateReviewRequestBody {
    @Type(() => Number)
    @IsInt()
    @Min(1, { message: "Rating should be greater than or equals 1" })
    @Max(5, { message: "Rating should be less than or equals 5" })
    rating: number

    @IsOptional()
    @Type(() => String)
    @IsString()
    @MaxLength(200, { message: "Review title must be less than 200 characters" })
    title: string = ""

    @IsOptional()
    @Type(() => String)
    @IsString()
    comment: string = ""

}

export class UpdateReviewRequestParams {
    @IsUUID()
    @IsString()
    reviewId: string
}


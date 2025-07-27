import { IsString, IsUUID } from "class-validator";

export class DeleteReviewRequestParams {
    @IsUUID()
    @IsString()
    reviewId: string
}


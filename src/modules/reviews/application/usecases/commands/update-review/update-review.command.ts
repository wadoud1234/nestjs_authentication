import { Command } from "@nestjs/cqrs";
import { UpdateReviewCommandResult } from "./update-review.result";
import { UpdateReviewRequestBody, UpdateReviewRequestParams } from "@/modules/reviews/presentation/contracts/requests/update-review.request";

export class UpdateReviewCommand extends Command<UpdateReviewCommandResult> {
    constructor(
        public readonly reviewId: string,
        public readonly title: string,
        public readonly comment: string,
        public readonly rating: number
    ) {
        super();
    }

    static from(
        body: UpdateReviewRequestBody,
        params: UpdateReviewRequestParams
    ): UpdateReviewCommand {
        return new UpdateReviewCommand(
            params.reviewId,
            body.title,
            body.comment,
            body.rating
        )
    }
}
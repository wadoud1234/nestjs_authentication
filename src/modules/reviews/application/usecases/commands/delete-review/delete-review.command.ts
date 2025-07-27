import { Command } from "@nestjs/cqrs";
import { DeleteReviewCommandResult } from "./delete-review.result";
import { DeleteReviewRequestParams } from "@/modules/reviews/presentation/contracts/requests/delete-review.request";

export class DeleteReviewCommand extends Command<DeleteReviewCommandResult> {
    constructor(
        public readonly reviewId: string,

    ) {
        super();
    }

    static from(params: DeleteReviewRequestParams): DeleteReviewCommand {
        return new DeleteReviewCommand(params.reviewId)
    }
}
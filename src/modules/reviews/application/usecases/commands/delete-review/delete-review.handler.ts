import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { Provider } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { DeleteReviewCommand } from "./delete-review.command";
import { DeleteReviewCommandResult } from "./delete-review.result";
import { InjectReviewsRepository, ReviewsRepository } from "@/modules/reviews/infrastructure/repositories/reviews.repository";
import { reviewsTable } from "@/shared/infrastructure/database/schema/user-engagement/reviews.table";

@CommandHandler(DeleteReviewCommand)
export class DeleteReviewCommandHandler implements ICommandHandler<DeleteReviewCommand> {

    constructor(
        @InjectReviewsRepository() private readonly reviewsRepository: ReviewsRepository
    ) { }

    async execute({ reviewId }: DeleteReviewCommand): Promise<DeleteReviewCommandResult> {

        await this.reviewsRepository.deleteByWhere(eq(reviewsTable.id, reviewId))

        return {}
    }

}

export const DeleteReviewCommandHandlerToken = Symbol("DeleteReviewCommandHandler");

export const DeleteReviewCommandHandlerProvider: Provider = {
    provide: DeleteReviewCommandHandlerToken,
    useClass: DeleteReviewCommandHandler
} 
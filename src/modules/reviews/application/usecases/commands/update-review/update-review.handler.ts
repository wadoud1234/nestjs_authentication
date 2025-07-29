import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { InjectPasswordHasher, PasswordHasher } from "@/modules/auth/application/services/password-hasher.service";
import { InvalidCredentialsException } from "@/modules/auth/domain/exceptions/invalid-credentials.exception";
import { Provider } from "@nestjs/common";
import { AuthJwtPayload } from "@/modules/auth/_sub-modules/jwts/domain/types/auth-jwt-payload.types";
import { Database, InjectDatabase } from "@/shared/infrastructure/database/database.module";
import { usersTable } from "@/shared/infrastructure/database/schema/identity/users.table";
import { eq } from "drizzle-orm";
import { UpdateReviewCommand } from "./update-review.command";
import { UpdateReviewCommandResult } from "./update-review.result";
import { BooksRepository, InjectBooksRepository } from "@/modules/books/infrastructure/repositories/books.repository";
import { InjectReviewsRepository, ReviewsRepository } from "@/modules/reviews/infrastructure/repositories/reviews.repository";
import { reviewsTable } from "@/shared/infrastructure/database/schema/user-engagement/reviews.table";
import { ReviewNotFoundException } from "@/modules/reviews/domain/exceptions/review-not-found.exception";

@CommandHandler(UpdateReviewCommand)
export class UpdateReviewCommandHandler implements ICommandHandler<UpdateReviewCommand> {

    constructor(
        @InjectDatabase() private readonly database: Database,
        @InjectBooksRepository() private readonly booksRepository: BooksRepository,
        @InjectReviewsRepository() private readonly reviewsRepository: ReviewsRepository
    ) { }

    async execute({ reviewId, title, comment, rating }: UpdateReviewCommand): Promise<UpdateReviewCommandResult> {

        const review = await this.database.transaction(async (tx) => {
            const whereCondition = eq(reviewsTable.id, reviewId)

            const isReviewExist = await this.reviewsRepository.isReviewExistByWhere(whereCondition, tx)

            if (!isReviewExist) {
                throw new ReviewNotFoundException()
            }

            const { bookId } = await this.reviewsRepository.updateFullReview({
                id: reviewId,
                rating,
                comment,
                title
            }, tx)

            // Calculate avg rating and ratings count
            const { avg: ratingsAvg, count: ratingsCount } = await this.reviewsRepository.countBookAvgRatingAndRatingsCount(bookId, tx);

            // Update the book ratings avg and ratings count
            await this.booksRepository.updateBookRating(bookId, ratingsAvg, ratingsCount, tx)

            // Find the created review
            const review = await this.reviewsRepository.findByWhereWithAuthor(whereCondition, tx);

            if (!review) {
                throw new ReviewNotFoundException()
            }

            // Return it
            return review;
        })

        return review;
    }

}

export const UpdateReviewCommandHandlerToken = Symbol("UpdateReviewCommandHandler");

export const UpdateReviewCommandHandlerProvider: Provider = {
    provide: UpdateReviewCommandHandlerToken,
    useClass: UpdateReviewCommandHandler
} 
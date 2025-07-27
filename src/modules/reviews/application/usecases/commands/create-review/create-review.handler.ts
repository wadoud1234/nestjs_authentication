import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { ConflictException, Provider } from "@nestjs/common";
import { Database, InjectDatabase } from "@/shared/infrastructure/database/database.module";
import { CreateReviewCommand } from "./create-review.command";
import { CreateReviewCommandResult } from "./create-review.result";
import { eq } from "drizzle-orm";
import { booksTable } from "@/shared/infrastructure/database/schema/books.table";
import { BookNotFoundException } from "@/modules/books/domain/exceptions/book-not-found.exception";
import { reviewsTable } from "@/shared/infrastructure/database/schema/reviews.table";
import { InjectReviewsRepository, ReviewsRepository } from "@/modules/reviews/infrastructure/repositories/reviews.repository";
import { BooksService, InjectBooksService } from "@/modules/books/application/services/books.service";
import { ReviewNotFoundException } from "@/modules/reviews/domain/exceptions/review-not-found.exception";

export interface CreateReviewCommandHandler extends ICommandHandler<CreateReviewCommand> { }

@CommandHandler(CreateReviewCommand)
export class CreateReviewCommandHandlerImpl implements CreateReviewCommandHandler {

    constructor(
        @InjectDatabase() private readonly database: Database,
        @InjectReviewsRepository() private readonly reviewsRepository: ReviewsRepository,
        @InjectBooksService() private readonly booksService: BooksService
    ) { }

    async execute({ bookId, authorId, comment, rating, title }: CreateReviewCommand): Promise<CreateReviewCommandResult> {

        const review = await this.database.transaction(async (tx) => {

            // Check book exist
            const isBookExist = await this.booksService.isBookExistByWhere(eq(booksTable.id, bookId), tx)

            if (!isBookExist) {
                throw new BookNotFoundException()
            }

            // Create new review
            const { id: createdReviewId } = await this.reviewsRepository.createReview({
                authorId,
                bookId,
                title,
                comment,
                rating
            }, tx)

            const whereCondition = eq(reviewsTable.id, createdReviewId)

            // Calculate avg rating and ratings count
            const { avg: ratingsAvg, count: ratingsCount } = await this.reviewsRepository.countBookAvgRatingAndRatingsCount(bookId, tx);

            // Update the book ratings avg and ratings count
            await this.booksService.updateBookRating(bookId, ratingsAvg, ratingsCount, tx)

            // Find the created review
            const review = await this.reviewsRepository.findByWhereWithAuthor(whereCondition, tx);

            if (!review) {
                throw new ReviewNotFoundException()
            }

            // Return it
            return review;
        })

        return review
    }
}
export const CreateReviewCommandHandlerToken = Symbol("CreateReviewCommandHandlerImpl");

export const CreateReviewCommandHandlerProvider: Provider = {
    provide: CreateReviewCommandHandlerToken,
    useClass: CreateReviewCommandHandlerImpl
} 
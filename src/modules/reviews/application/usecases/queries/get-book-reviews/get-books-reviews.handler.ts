import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { Database, InjectDatabase } from "@/shared/infrastructure/database/database.module";
import { usersTable } from "@/shared/infrastructure/database/schema/users.table";
import { eq } from "drizzle-orm";
import { Provider, UnauthorizedException } from "@nestjs/common";
import { GetBookReviewsQuery } from "./get-book-reviews.query";
import { GetBookReviewsQueryResult } from "./get-book-reviews.result";
import { BooksRepository, InjectBooksRepository } from "@/modules/books/infrastructure/repositories/books.repository";
import { booksTable } from "@/shared/infrastructure/database/schema/books.table";
import { BookNotFoundException } from "@/modules/books/domain/exceptions/book-not-found.exception";
import { InjectReviewsRepository, ReviewsRepository } from "@/modules/reviews/infrastructure/repositories/reviews.repository";
import { reviewsTable } from "@/shared/infrastructure/database/schema/reviews.table";

export interface GetBookReviewsQueryHandler extends IQueryHandler<GetBookReviewsQuery> { }

@QueryHandler(GetBookReviewsQuery)
export class GetBookReviewsQueryHandlerImpl implements GetBookReviewsQueryHandler {
    constructor(
        @InjectDatabase() private readonly database: Database,
        @InjectBooksRepository() private readonly booksRepository: BooksRepository,
        @InjectReviewsRepository() private readonly reviewsRepository: ReviewsRepository
    ) { }

    async execute({ bookSlug, size, offset, page }: GetBookReviewsQuery): Promise<GetBookReviewsQueryResult> {
        const book = await this.booksRepository.isBookExistByWhere(eq(booksTable.slug, bookSlug));

        if (!book) {
            throw new BookNotFoundException()
        }
        const { id: bookId } = book;

        const whereCondition = eq(reviewsTable.bookId, bookId)

        const reviews = await this.reviewsRepository.findReviewsByWhereWithAuthor(
            whereCondition,
            {
                limit: size,
                offset
            }
        )

        const reviewsCount = await this.reviewsRepository.countReviewsByWhere(whereCondition);

        return {
            values: reviews,
            page,
            size,
            numberOfPages: Math.ceil(reviewsCount / size),
            numberOfValues: reviewsCount
        }
    }
}

export const GetBookReviewsQueryHandlerToken = Symbol("GetBookReviewsQueryHandler")

export const GetBookReviewsQueryHandlerProvider: Provider = {
    provide: GetBookReviewsQueryHandlerToken,
    useClass: GetBookReviewsQueryHandlerImpl
}
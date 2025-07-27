import { Database, InjectDatabase } from "@/shared/infrastructure/database/database.module"
import { reviewsTable } from "@/shared/infrastructure/database/schema/reviews.table"
import { Inject, Provider } from "@nestjs/common"
import { avg, count, eq, SQL, SQLWrapper } from "drizzle-orm"
import { ReviewWithAuthorResponsePayload } from "../../presentation/contracts/responses/review-with-author.response"
import { DatabaseTransaction } from "@/shared/infrastructure/database/providers/transaction-manager.provider"
import { ReviewEntity } from "../../domain/entities/review.entity"
import { PgTable } from "drizzle-orm/pg-core"
import { PgViewBase } from "drizzle-orm/pg-core/view-base"

export interface ReviewsRepository {

    findByWhereWithAuthor(where: SQL, tx: DatabaseTransaction): Promise<ReviewWithAuthorResponsePayload | null>
    findByWhereWithAuthor(where: SQL, tx: void): Promise<ReviewWithAuthorResponsePayload | null>

    createReview(input: CreateReviewInput, tx: void): Promise<{ id: string }>
    createReview(input: CreateReviewInput, tx: DatabaseTransaction): Promise<{ id: string }>

    countBookAvgRatingAndRatingsCount(bookId: string, tx: void): Promise<{ avg: string, count: number }>
    countBookAvgRatingAndRatingsCount(bookId: string, tx: DatabaseTransaction): Promise<{ avg: string, count: number }>

    findReviewsByWhereWithAuthor(where: SQL, options: { limit?: number, offset?: number }, tx: DatabaseTransaction): Promise<ReviewWithAuthorResponsePayload[]>
    findReviewsByWhereWithAuthor(where: SQL, options: { limit?: number, offset?: number }, tx: void): Promise<ReviewWithAuthorResponsePayload[]>

    countReviewsByWhere(where: SQL, tx: void): Promise<number>
    countReviewsByWhere(where: SQL, tx: DatabaseTransaction): Promise<number>

    isReviewExistByWhere(where: SQL, tx: DatabaseTransaction): Promise<boolean>
    isReviewExistByWhere(where: SQL, tx: void): Promise<boolean>

    updateFullReview(input: UpdateReviewInput, tx: DatabaseTransaction): Promise<{ bookId: string; }>
    updateFullReview(input: UpdateReviewInput, tx: void): Promise<{ bookId: string; }>

    deleteByWhere(where: SQL, tx: void): Promise<void>
    deleteByWhere(where: SQL, tx: DatabaseTransaction): Promise<void>
}

export class ReviewsRepositoryImpl implements ReviewsRepository {

    constructor(
        @InjectDatabase() private readonly database: Database
    ) { }

    async isReviewExistByWhere(where: SQL, tx: DatabaseTransaction | void) {
        const review = await (tx || this.database).query.reviewsTable.findFirst({
            where,
            columns: {
                id: true
            }
        })

        if (!review || !review.id) return false
        return true
    }

    async findByWhereWithAuthor(where: SQL, tx: DatabaseTransaction | void): Promise<ReviewWithAuthorResponsePayload | null> {
        const review = await (tx || this.database).query.reviewsTable.findFirst({
            where,
            columns: {
                id: true,
                title: true,
                comment: true,
                rating: true,
                createdAt: true,
                updatedAt: true,
                bookId: true,
                userId: true
            },
            with: {
                user: {
                    columns: {
                        id: true,
                        name: true
                    }
                }
            }
        })
        if (!review || !review.id) return null
        const formattedReview = {
            ...review,
            author: review.user,
            authorId: review.userId
        }
        return formattedReview;
    }

    async createReview(input: CreateReviewInput, tx: DatabaseTransaction | void) {
        return await (tx || this.database)
            .insert(reviewsTable)
            .values({
                rating: input.rating,
                bookId: input.bookId,
                title: input.title,
                comment: input.comment,
                userId: input.authorId,
            })
            .returning({
                id: reviewsTable.id
            })
            .then(r => r?.[0])
    }

    async countBookAvgRatingAndRatingsCount(bookId: string, tx: DatabaseTransaction | void) {
        const ratings = await (tx || this.database)
            .select({
                ratingAvg: avg(reviewsTable.rating),
                ratingsCount: count(reviewsTable)
            })
            .from(reviewsTable)
            .where(eq(reviewsTable.bookId, bookId));

        const { ratingAvg, ratingsCount } = ratings[0];
        return {
            avg: ratingAvg ?? "0",
            count: ratingsCount
        }
    }

    async findReviewsByWhereWithAuthor(where: SQL, options: { limit?: number, offset?: number }, tx: DatabaseTransaction | void) {
        const reviews = await (tx || this.database).query.reviewsTable.findMany({
            where,
            limit: options.limit ? options.limit : undefined,
            offset: !options.offset || options.offset === 0 ? undefined : options.offset,
            columns: {
                id: true,
                title: true,
                comment: true,
                rating: true,
                createdAt: true,
                updatedAt: true,
                bookId: true,
                userId: true
            },
            with: {
                user: {
                    columns: {
                        id: true,
                        name: true,
                    }
                }
            }
        })

        const formattedReviews = reviews.map(review => {
            const { user, userId, ...properties } = review;
            return ({
                ...properties,
                authorId: userId,
                author: user
            })
        })

        return formattedReviews
    }

    async countReviewsByWhere(where: SQL, tx: DatabaseTransaction | void) {
        return (tx || this.database).select({ count: count() }).from(reviewsTable).where(where).then(r => r?.[0]?.count)
    }

    async updateFullReview(input: UpdateReviewInput, tx: DatabaseTransaction | void) {
        return await (tx || this.database)
            .update(reviewsTable)
            .set({
                rating: input.rating,
                title: input.title,
                comment: input.comment
            })
            .where(eq(reviewsTable.id, input.id))
            .returning({
                bookId: reviewsTable.bookId
            }).then(r => r?.[0])
    }

    async deleteByWhere(where: SQL, tx: DatabaseTransaction | void) {
        await (tx || this.database).delete(reviewsTable).where(where)
    }
}

export const ReviewsRepositoryToken = Symbol("ReviewsRepository")

export const InjectReviewsRepository = () => Inject(ReviewsRepositoryToken)

export const ReviewsRepositoryProvider: Provider = {
    provide: ReviewsRepositoryToken,
    useClass: ReviewsRepositoryImpl
}

export interface CreateReviewInput extends Pick<ReviewEntity, "authorId" | "comment" | "rating" | "bookId" | "title"> { }
export interface UpdateReviewInput extends Pick<ReviewEntity, "id" | "comment" | "rating" | "title"> { }
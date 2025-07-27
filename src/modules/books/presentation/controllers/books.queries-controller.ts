import { Public } from "@/modules/auth/presentation/decorators/is-public.decorator";
import { SuccessResponsePayload } from "@/shared/presentation/contracts/responses/success.response";
import { Controller, Get, Param, Query } from "@nestjs/common";
import { GetBooksResponsePayload } from "../contracts/responses/get-books.response";
import { GetBookDetailsRequestParamsById, GetBookDetailsRequestParamsBySlug } from "../contracts/requests/get-book-details.request";
import { GetBookDetailsQuery } from "../../application/usecases/queries/get-book-details/get-book-details.query";
import { GetBooksQuery } from "../../application/usecases/queries/get-books/get-books.query";
import { QueryBus } from "@nestjs/cqrs";
import { GetBooksRequestQuery } from "../contracts/requests/get-books.request";
import { CurrentUser } from "@/modules/auth/presentation/decorators/current-user.decorator";
import { UserEntity } from "@/modules/users/domain/entities/user.entity";
import { GetBookReviewsRequestParams, GetBookReviewsRequestQuery } from "@/modules/reviews/presentation/contracts/requests/get-book-reviews.request";
import { GetBookReviewsQuery } from "@/modules/reviews/application/usecases/queries/get-book-reviews/get-book-reviews.query";

@Controller("books")
export class BooksQueriesController {

    constructor(
        private readonly queryBus: QueryBus
    ) { }

    // GET BOOKS BY PAGINATION
    @Public()
    @Get()
    async getPaginatedBooks(
        @Query() query: GetBooksRequestQuery,
        @CurrentUser() currentUser: UserEntity
    ): Promise<SuccessResponsePayload<GetBooksResponsePayload>> {
        return {
            data: await this.queryBus.execute(GetBooksQuery.from(query, currentUser))
        }
    }

    // GET BOOK DETAILS BY ITS SLUG
    @Get("slug/:bookSlug")
    async getBookDetailsBySlug(
        @Param() params: GetBookDetailsRequestParamsBySlug
    ) {
        return {
            data: await this.queryBus.execute(new GetBookDetailsQuery().fromParamsBySlug(params))
        }
    }

    // GET BOOK DETAILS BY ITS ID
    @Get(":id")
    async getBookDetailsById(
        @Param() params: GetBookDetailsRequestParamsById
    ) {
        return {
            data: await this.queryBus.execute(new GetBookDetailsQuery().fromParamsById(params))
        }
    }

    @Get("slug/:bookSlug/reviews")
    async getBookReview(
        @Param() params: GetBookReviewsRequestParams,
        @Query() query: GetBookReviewsRequestQuery
    ) {
        return {
            data: await this.queryBus.execute(GetBookReviewsQuery.from(params, query))
        }
    }
}
import { Public } from "@/modules/auth/presentation/decorators/is-public.decorator";
import { SuccessResponsePayload } from "@/shared/presentation/contracts/responses/success.response";
import { Controller, ForbiddenException, Get, NotFoundException, Param, Query } from "@nestjs/common";
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
import { BooksRepository, InjectBooksRepository } from "../../infrastructure/repositories/books.repository";
import { BooksPolicyService, InjectBooksPolicy } from "../../application/services/books-policy.service";
import { HasPermission } from "@/modules/auth/_sub-modules/access-control/presentation/decorators/has-permission.decorator";
import { PermissionsEnum } from "@/shared/infrastructure/database/schema/identity/permissions.table";

@Controller("books")
export class BooksQueriesController {

    constructor(
        private readonly queryBus: QueryBus,
        @InjectBooksRepository() private readonly booksRepository: BooksRepository,
        @InjectBooksPolicy() private readonly bookPolicy: BooksPolicyService
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
        @Param() params: GetBookDetailsRequestParamsBySlug,
        @CurrentUser() currentUser: UserEntity
    ) {

        return {
            data: await this.queryBus.execute(
                new GetBookDetailsQuery().fromParamsBySlug(params, currentUser)
            )
        }
    }

    // GET BOOK DETAILS BY ITS ID
    @Get(":id")
    async getBookDetailsById(
        @Param() params: GetBookDetailsRequestParamsById,
        @CurrentUser() currentUser: UserEntity
    ) {
        return {
            data: await this.queryBus.execute(
                new GetBookDetailsQuery().fromParamsById(params, currentUser)
            )
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
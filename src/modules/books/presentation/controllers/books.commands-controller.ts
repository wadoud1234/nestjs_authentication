import { CurrentUser } from "@/modules/auth/presentation/decorators/current-user.decorator";
import { SuccessResponsePayload } from "@/shared/presentation/contracts/responses/success.response";
import { Body, Controller, Delete, HttpCode, HttpStatus, Param, Patch, Post, Put } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { BookWithAuthorAndCategoryResponsePayload } from "../contracts/responses/book-with-author-and-category.response";
import { CreateBookRequestBody } from "../contracts/requests/create-book.request";
import { UserEntity } from "@/modules/users/domain/entities/user.entity";
import { CreateBookCommand } from "../../application/usecases/commands/create-book/create-book.command";
import { UpdateBookRequestBody, UpdateBookRequestParams } from "../contracts/requests/update-book.request";
import { UpdateBookCommand } from "../../application/usecases/commands/update-book/update-book.command";
import { UpdateBookIsPublishedRequestBody, UpdateBookIsPublishedRequestParams } from "../contracts/requests/update-book-publish.request";
import { UpdateBookIsPublishedCommand } from "../../application/usecases/commands/update-book-is-published/update-book-is-published.command";
import { DeleteBookRequestParams } from "../contracts/requests/delete-book.request";
import { DeleteBookCommand } from "../../application/usecases/commands/delete-book/delete-book.command";
import { ToggleWishlistBookCommand } from "@/modules/wishlists/application/usecases/commands/toggle-wishlist/toggle-wishlist.command";
import { ToggleWishlistBookRequestParams } from "../contracts/requests/toggle-wishlist-book.request";
import { CreateReviewRequestBody, CreateReviewRequestParams } from "@/modules/reviews/presentation/contracts/requests/create-review.request";
import { CreateReviewCommand } from "@/modules/reviews/application/usecases/commands/create-review/create-review.command";
import { HasPermission } from "@/modules/auth/_sub-modules/access-control/presentation/decorators/has-permission.decorator";
import { PermissionsEnum } from "@/shared/infrastructure/database/schema/identity/permissions.table";
import { DeleteWishlistCommand } from "@/modules/wishlists/application/usecases/commands/delete-wishlist/delete-wishlist.command";

@Controller("books")
export class BooksCommandsController {

    constructor(
        private readonly commandBus: CommandBus
    ) { }

    // CREATE NEW BOOK
    @HasPermission(PermissionsEnum.BOOK_CREATE)
    @HttpCode(HttpStatus.CREATED)
    @Post()
    async createBook(
        @Body() body: CreateBookRequestBody,
        @CurrentUser() currentUser: UserEntity
    ): Promise<SuccessResponsePayload<BookWithAuthorAndCategoryResponsePayload>> {
        return { data: await this.commandBus.execute(CreateBookCommand.from(body, currentUser)) }
    }

    // UPDATE FULL BOOK
    @HasPermission(PermissionsEnum.BOOK_EDIT_ANY, PermissionsEnum.BOOK_EDIT_OWN)
    @Put(":id")
    async updateBook(
        @Body() body: UpdateBookRequestBody,
        @Param() params: UpdateBookRequestParams,
        @CurrentUser() currentUser: UserEntity
    ) {
        return {
            data: await this.commandBus.execute(UpdateBookCommand.from(body, params, currentUser))
        }
    }

    // PUBLISH BOOK
    @HasPermission(PermissionsEnum.BOOK_PUBLISH)
    @Patch(":id/update-publish")
    async updateBookIsPublished(
        @Body() body: UpdateBookIsPublishedRequestBody,
        @Param() params: UpdateBookIsPublishedRequestParams
    ) {
        return {
            data: await this.commandBus.execute(UpdateBookIsPublishedCommand.from(body, params))
        }
    }

    // @HasPermission(PermissionsEnum.WISHLIST_ITEM_CREATE)
    @Post(":id/wishlist")
    async toggleWishlistBook(
        @Param() params: ToggleWishlistBookRequestParams,
        @CurrentUser() currentUser: UserEntity
    ) {
        return {
            data: await this.commandBus.execute(ToggleWishlistBookCommand.from(params, currentUser))
        }
    }

    // @Delete(":id/wishlist")
    // async deleteWishlistBook(
    //     @Param() params: ToggleWishlistBookRequestParams,
    //     @CurrentUser() currentUser: UserEntity
    // ) {
    //     return {
    //         data: await this.commandBus.execute(DeleteWishlistCommand.from(params))
    //     }
    // }

    // CREATE REVIEW
    @HasPermission(PermissionsEnum.REVIEW_CREATE)
    @Post(":id/reviews")
    async create(
        @Body() body: CreateReviewRequestBody,
        @Param() params: CreateReviewRequestParams,
        @CurrentUser() currentUser: UserEntity
    ) {
        return {
            data: await this.commandBus.execute(CreateReviewCommand.from(body, params, currentUser))
        }
    }

    // DELETE BOOK
    @HasPermission(PermissionsEnum.BOOK_DELETE_ANY, PermissionsEnum.BOOK_DELETE_OWN)
    @HttpCode(HttpStatus.NO_CONTENT)
    @Delete(":bookId")
    async deleteBook(
        @Param() params: DeleteBookRequestParams,
        @CurrentUser() currentUser: UserEntity
    ): Promise<SuccessResponsePayload<null>> {
        await this.commandBus.execute(DeleteBookCommand.from(params, currentUser))
        return { data: null }
    }
}
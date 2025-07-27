import { Controller, Delete, HttpCode, HttpStatus, Param, Post } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { DeleteWishlistRequestParams } from "../contracts/requests/delete-wishlist.request";
import { DeleteWishlistCommand } from "../../application/usecases/commands/delete-wishlist/delete-wishlist.command";

@Controller("wishlists")
export class WishlistsCommandsController {

    constructor(
        private readonly commandBus: CommandBus
    ) { }


    @HttpCode(HttpStatus.NO_CONTENT)
    @Delete(":id")
    async deleteWishlist(
        @Param() params: DeleteWishlistRequestParams
    ) {
        return {
            data: await this.commandBus.execute(DeleteWishlistCommand.from(params))
        }
    }
}
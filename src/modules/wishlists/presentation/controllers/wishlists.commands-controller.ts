import { Controller, Delete, HttpCode, HttpStatus, Param, Post } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { DeleteWishlistRequestParams } from "../contracts/requests/delete-wishlist.request";
import { DeleteWishlistCommand } from "../../application/usecases/commands/delete-wishlist/delete-wishlist.command";
import { HasPermission } from "@/modules/auth/_sub-modules/access-control/presentation/decorators/has-permission.decorator";
import { PermissionsEnum } from "@/shared/infrastructure/database/schema/identity/permissions.table";

@Controller("wishlists")
export class WishlistsCommandsController {

    constructor(
        private readonly commandBus: CommandBus
    ) { }


    @HasPermission(PermissionsEnum.WISHLIST_ITEM_CREATE)
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
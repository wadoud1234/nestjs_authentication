import { CurrentUser } from "@/modules/auth/presentation/decorators/current-user.decorator";
import { UserEntity } from "@/modules/users/domain/entities/user.entity";
import { Body, Controller, Delete, HttpCode, HttpStatus, Param, Post, Put } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { AddCartItemRequestBody } from "../contracts/requests/add-cart-item.request";
import { AddCartItemCommand } from "../../application/usecases/commands/add-cart-item/add-cart-item.command";
import { UpdateCartItemQuantityRequestBody, UpdateCartItemQuantityRequestParams } from "../contracts/requests/update-cart-item-quantity.request";
import { UpdateCartItemQuantityCommand } from "../../application/usecases/commands/update-cart-item-quantity/update-cart-item-quantity.command";
import { DeleteCartItemRequestParams } from "../contracts/requests/delete-cart-item.request";
import { DeleteCartItemCommand } from "../../application/usecases/commands/delete-cart-item/delete-cart-item.command";
import { ClearCartCommand } from "../../application/usecases/commands/clear-cart/clear-cart.command";

@Controller("carts")
export class CartsCommandsController {

    constructor(
        private readonly commandsBus: CommandBus
    ) { }

    @HttpCode(HttpStatus.CREATED)
    @Post("items")
    async addItem(
        @Body() body: AddCartItemRequestBody,
        @CurrentUser() currentUser: UserEntity
    ) {
        return {
            data: await this.commandsBus.execute(AddCartItemCommand.from(body, currentUser))
        }
    }

    @Put("items/:cartItemId")
    async updateCartItemQuantity(
        @Body() body: UpdateCartItemQuantityRequestBody,
        @Param() params: UpdateCartItemQuantityRequestParams,
    ) {
        return {
            data: await this.commandsBus.execute(UpdateCartItemQuantityCommand.from(body, params))
        }
    }

    @HttpCode(HttpStatus.NO_CONTENT)
    @Delete("items/:cartItemId")
    async deleteCartItem(
        @Param() params: DeleteCartItemRequestParams,
    ) {
        return {
            data: await this.commandsBus.execute(DeleteCartItemCommand.from(params))
        }
    }

    @HttpCode(HttpStatus.NO_CONTENT)
    @Delete()
    async clearCart(
        @CurrentUser() currentUser: UserEntity
    ) {
        return {
            data: await this.commandsBus.execute(ClearCartCommand.from(currentUser))
        }
    }
}
import { CurrentUser } from "@/modules/auth/presentation/decorators/current-user.decorator";
import { UserEntity } from "@/modules/users/domain/entities/user.entity";
import { Controller, Get } from "@nestjs/common";
import { QueryBus } from "@nestjs/cqrs";
import { GetCartQuery } from "../../application/usecases/queries/get-cart/get-cart.query";
import { GetCartItemsCountQuery } from "../../application/usecases/queries/get-cart-items-count/get-cart-items-count.query";

@Controller("carts")
export class CartsQueriesController {

    constructor(
        private readonly queryBus: QueryBus
    ) { }

    @Get()
    async getCart(
        @CurrentUser() currentUser: UserEntity
    ) {
        return {
            data: await this.queryBus.execute(GetCartQuery.from(currentUser))
        }
    }

    @Get("count")
    async getCartCount(
        @CurrentUser() currentUser: UserEntity
    ) {
        return {
            data: await this.queryBus.execute(GetCartItemsCountQuery.from(currentUser))
        }
    }

}
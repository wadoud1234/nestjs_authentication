import { CurrentUser } from "@/modules/auth/presentation/decorators/current-user.decorator";
import { UserEntity } from "@/modules/users/domain/entities/user.entity";
import { Controller, Get } from "@nestjs/common";
import { QueryBus } from "@nestjs/cqrs";
import { GetWishlistQuery } from "../../application/usecases/queries/get-wishlist/get-wishlist.query";

@Controller("wishlists")
export class WishlistsQueriesController {

    constructor(
        private readonly queryBus: QueryBus
    ) { }

    @Get()
    async getWishlist(
        @CurrentUser() currentUser: UserEntity
    ) {
        return {
            data: await this.queryBus.execute(GetWishlistQuery.from(currentUser))
        }
    }

}
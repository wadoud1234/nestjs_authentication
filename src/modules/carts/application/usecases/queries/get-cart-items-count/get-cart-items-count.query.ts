import { Query } from "@nestjs/cqrs";
import { UserEntity } from "@/modules/users/domain/entities/user.entity";
import { GetCartItemsCountQueryResult } from "./get-cart-items-count.result";

export class GetCartItemsCountQuery extends Query<GetCartItemsCountQueryResult> {
    constructor(
        public readonly currentUserId: string
    ) {
        super()
    }

    public static from(
        currentUser: UserEntity
    ) {
        return new GetCartItemsCountQuery(currentUser.id)
    }
}
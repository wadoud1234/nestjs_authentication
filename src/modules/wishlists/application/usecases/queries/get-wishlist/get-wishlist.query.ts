import { Query } from "@nestjs/cqrs";
import { GetWishlistQueryResult } from "./get-wishlist.result";
import { UserEntity } from "@/modules/users/domain/entities/user.entity";

export class GetWishlistQuery extends Query<GetWishlistQueryResult> {
    constructor(
        public readonly userId: string
    ) {
        super()
    }

    public static from(currentUser: UserEntity) {
        return new GetWishlistQuery(currentUser.id)
    }
}
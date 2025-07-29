import { Query } from "@nestjs/cqrs";
import { UserEntity } from "@/modules/users/domain/entities/user.entity";
import { GetCartQueryResult } from "./get-cart.result";

export class GetCartQuery extends Query<GetCartQueryResult> {
    constructor(
        public readonly currentUserId: string
    ) {
        super()
    }

    public static from(
        currentUser: UserEntity
    ) {
        return new GetCartQuery(currentUser.id)
    }
}
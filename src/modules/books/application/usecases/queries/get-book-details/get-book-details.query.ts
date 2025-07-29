import { Query } from "@nestjs/cqrs";
import { GetBookDetailsQueryResult } from "./get-book-details.result";
import { GetBookDetailsRequestParamsBySlug, GetBookDetailsRequestParamsById } from "@/modules/books/presentation/contracts/requests/get-book-details.request";
import { UserEntity } from "@/modules/users/domain/entities/user.entity";

export enum GetBookDetailsQueryType {
    ID = "ID",
    SLUG = "SLUG"
}

export class GetBookDetailsQuery extends Query<GetBookDetailsQueryResult> {
    private bookId?: string
    private bookSlug?: string
    private queryType: GetBookDetailsQueryType
    private currentUser: UserEntity

    constructor() {
        super()
    }

    public fromParamsBySlug(
        params: GetBookDetailsRequestParamsBySlug,
        currentUser: UserEntity
    ) {
        this.bookSlug = params.bookSlug;
        this.currentUser = currentUser;
        this.queryType = GetBookDetailsQueryType.SLUG
        return this
    }

    public fromParamsById(
        params: GetBookDetailsRequestParamsById,
        currentUser: UserEntity
    ) {
        this.bookId = params.id
        this.currentUser = currentUser;
        this.queryType = GetBookDetailsQueryType.ID
        return this
    }

    get query() {
        switch (this.queryType) {
            case GetBookDetailsQueryType.ID: {
                return {
                    type: this.queryType,
                    currentUser: this.currentUser,
                    bookId: this.bookId as string,
                } as const
            }
            case GetBookDetailsQueryType.SLUG: {
                return {
                    type: this.queryType,
                    currentUser: this.currentUser,
                    bookSlug: this.bookSlug as string
                } as const
            }
        }
    }
}
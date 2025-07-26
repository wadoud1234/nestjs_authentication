import { Query } from "@nestjs/cqrs";
import { GetBookDetailsQueryResult } from "./get-book-details.result";
import { GetBookDetailsRequestParamsBySlug, GetBookDetailsRequestParamsById } from "@/modules/books/presentation/contracts/requests/get-book-details.request";

export enum GetBookDetailsQueryType {
    ID = "ID",
    SLUG = "SLUG"
}

export class GetBookDetailsQuery extends Query<GetBookDetailsQueryResult> {
    private bookId?: string
    private bookSlug?: string
    private queryType: GetBookDetailsQueryType

    constructor() {
        super()
    }

    public fromParamsBySlug(params: GetBookDetailsRequestParamsBySlug) {
        this.bookSlug = params.bookSlug;
        this.queryType = GetBookDetailsQueryType.SLUG
        return this
    }

    public fromParamsById(params: GetBookDetailsRequestParamsById) {
        this.bookId = params.id
        this.queryType = GetBookDetailsQueryType.ID
        return this
    }

    get query() {
        switch (this.queryType) {
            case GetBookDetailsQueryType.ID: {
                return {
                    type: this.queryType,
                    bookId: this.bookId as string,
                } as const
            }
            case GetBookDetailsQueryType.SLUG: {
                return {
                    type: this.queryType,
                    bookSlug: this.bookSlug as string
                } as const
            }
        }
    }
}
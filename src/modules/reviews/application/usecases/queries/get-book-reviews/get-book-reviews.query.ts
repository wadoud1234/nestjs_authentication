import { Query } from "@nestjs/cqrs";
import { GetBookReviewsQueryResult } from "./get-book-reviews.result";
import { GetBookReviewsRequestParams, GetBookReviewsRequestQuery } from "@/modules/reviews/presentation/contracts/requests/get-book-reviews.request";

export class GetBookReviewsQuery extends Query<GetBookReviewsQueryResult> {
    constructor(
        public readonly bookSlug: string,
        public readonly page: number,
        public readonly size: number,
    ) {
        super()
    }

    public static from(params: GetBookReviewsRequestParams, query: GetBookReviewsRequestQuery) {
        return new GetBookReviewsQuery(
            params.bookSlug,
            query.page,
            query.size
        )
    }

    get offset() {
        if (this.page <= 0) return 0
        return (this.page - 1) * this.size
    }
}
import { ReviewWithAuthorResponsePayload } from "@/modules/reviews/presentation/contracts/responses/review-with-author.response";
import { PaginatedResponsePayload } from "@/shared/presentation/contracts/responses/paginated.response";

export class GetBookReviewsQueryResult extends PaginatedResponsePayload<ReviewWithAuthorResponsePayload> { }
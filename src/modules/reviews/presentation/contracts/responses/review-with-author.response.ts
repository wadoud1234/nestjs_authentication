import { ReviewEntity } from "@/modules/reviews/domain/entities/review.entity";

export class ReviewWithAuthorResponsePayload extends ReviewEntity {
    author: {
        id: string,
        name: string
    }
}
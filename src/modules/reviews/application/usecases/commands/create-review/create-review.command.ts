import { Command } from "@nestjs/cqrs";
import { CreateReviewRequestBody, CreateReviewRequestParams } from "@/modules/reviews/presentation/contracts/requests/create-review.request";
import { UserEntity } from "@/modules/users/domain/entities/user.entity";
import { CreateReviewCommandResult } from "./create-review.result";

export class CreateReviewCommand extends Command<CreateReviewCommandResult> {
    constructor(
        public readonly bookId: string,
        public readonly authorId: string,
        public readonly title: string,
        public readonly comment: string,
        public readonly rating: number
    ) {
        super()
    }

    public static from(
        body: CreateReviewRequestBody,
        params: CreateReviewRequestParams,
        currentUser: UserEntity
    ) {
        return new CreateReviewCommand(
            params.id,
            currentUser.id,
            body.title,
            body.comment,
            body.rating
        );
    }
}
import { Provider } from "@nestjs/common";
import { CreateReviewCommandHandlerProvider } from "../application/usecases/commands/create-review/create-review.handler";
import { ReviewsRepositoryProvider } from "./repositories/reviews.repository";
import { GetBookReviewsQueryHandlerProvider } from "../application/usecases/queries/get-book-reviews/get-books-reviews.handler";
import { UpdateReviewCommandHandlerProvider } from "../application/usecases/commands/update-review/update-review.handler";
import { DeleteBookCommandHandlerProvider } from "@/modules/books/application/usecases/commands/delete-book/delete-book.handler";
import { DeleteReviewCommandHandlerProvider } from "../application/usecases/commands/delete-review/delete-review.handler";

export const ReviewsModuleCommandHandlers: Provider[] = [
    CreateReviewCommandHandlerProvider,
    UpdateReviewCommandHandlerProvider,
    DeleteReviewCommandHandlerProvider
]

export const ReviewsModuleQueryHandlers: Provider[] = [
    GetBookReviewsQueryHandlerProvider
]

export const ReviewsModuleRepositories: Provider[] = [
    ReviewsRepositoryProvider
]
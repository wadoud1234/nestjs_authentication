import { Module } from "@nestjs/common";
import { ReviewsCommandsController } from "../presentation/controllers/reviews.commands-controller";
import { ReviewsQueriesController } from "../presentation/controllers/reviews.queries-controller";
import { ReviewsModuleCommandHandlers, ReviewsModuleQueryHandlers, ReviewsModuleRepositories } from "./reviews.module-providers";
import { BooksModule } from "@/modules/books/infrastructure/books.module";

@Module({
    imports: [BooksModule],
    controllers: [
        ReviewsCommandsController,
        ReviewsQueriesController
    ],
    providers: [
        ...ReviewsModuleCommandHandlers,
        ...ReviewsModuleQueryHandlers,
        ...ReviewsModuleRepositories
    ],
    exports: [
        ...ReviewsModuleRepositories
    ]

})
export class ReviewsModule { }
import { Module } from "@nestjs/common";
import { BooksModuleCommandHandlers, BooksModuleGuards, BooksModuleQueryHandlers, BooksModuleRepositories, BooksModuleServices } from "./books.module-providers";
import { BooksCommandsController } from "../presentation/controllers/books.commands-controller";
import { BooksQueriesController } from "../presentation/controllers/books.queries-controller";
import { CategoriesModule } from "@/modules/categories/infrastructure/categories.module";

@Module({
    imports: [CategoriesModule],
    controllers: [BooksQueriesController, BooksCommandsController],
    providers: [
        ...BooksModuleCommandHandlers,
        ...BooksModuleQueryHandlers,
        ...BooksModuleServices,
        ...BooksModuleGuards,
        ...BooksModuleRepositories,
    ],
    exports: [
        ...BooksModuleServices,
        ...BooksModuleRepositories,
        ...BooksModuleGuards
    ]
})
export class BooksModule { }
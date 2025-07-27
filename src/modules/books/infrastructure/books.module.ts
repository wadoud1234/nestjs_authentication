import { Module } from "@nestjs/common";
import { BooksModuleCommandHandlers, BooksModuleGuards, BooksModuleQueryHandlers, BooksModuleRepositories, BooksModuleServices } from "./books.module-providers";
import { BooksCommandsController } from "../presentation/controllers/books.commands-controller";
import { BooksQueriesController } from "../presentation/controllers/books.queries-controller";

@Module({
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
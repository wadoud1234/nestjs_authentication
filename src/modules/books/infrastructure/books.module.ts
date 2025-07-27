import { Module } from "@nestjs/common";
import { BooksModuleCommandHandlers, BooksModuleGuards, BooksModuleQueryHandlers, BooksModuleServices } from "./books.module-providers";
import { BooksCommandsController } from "../presentation/controllers/books.commands-controller";
import { BooksQueriesController } from "../presentation/controllers/books.queries-controller";

@Module({
    controllers: [BooksQueriesController, BooksCommandsController],
    providers: [
        ...BooksModuleCommandHandlers,
        ...BooksModuleQueryHandlers,
        ...BooksModuleServices,
        ...BooksModuleGuards
    ],
    exports: [
        ...BooksModuleServices,
        ...BooksModuleGuards
    ]
})
export class BooksModule { }
import { Provider } from "@nestjs/common";
import { GetBooksQueryHandlerProvider } from "../application/usecases/queries/get-books/get-books.handler";
import { SlugGeneratorServiceProvider } from "../application/services/slug-generator.service";
import { CreateBookCommandHandlerProvider } from "../application/usecases/commands/create-book/create-book.handler";
import { BooksRepositoryProvider } from "./repositories/books.repository";
import { UpdateBookCommandHandlerProvider } from "../application/usecases/commands/update-book/update-book.handler";
import { GetBookDetailsQueryHandlerProvider } from "../application/usecases/queries/get-book-details/get-book-details.handler";
import { UpdateBookIsPublishedCommandHandlerProvider } from "../application/usecases/commands/update-book-is-published/update-book-is-published.handler";
import { DeleteBookCommandHandlerProvider } from "../application/usecases/commands/delete-book/delete-book.handler";

export const BooksModuleServices: Provider[] = [
    SlugGeneratorServiceProvider,
]

export const BooksModuleRepositories: Provider[] = [
    BooksRepositoryProvider
]

export const BooksModuleCommandHandlers: Provider[] = [
    CreateBookCommandHandlerProvider,
    UpdateBookCommandHandlerProvider,
    UpdateBookIsPublishedCommandHandlerProvider,
    DeleteBookCommandHandlerProvider
]

export const BooksModuleQueryHandlers: Provider[] = [
    GetBooksQueryHandlerProvider,
    GetBookDetailsQueryHandlerProvider
]

export const BooksModuleGuards: Provider[] = []
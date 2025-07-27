import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetBookDetailsQuery, GetBookDetailsQueryType } from "./get-book-details.query";
import { GetBookDetailsQueryResult } from "./get-book-details.result";
import { ConflictException, Provider } from "@nestjs/common";
import { BooksRepository, InjectBooksRepository } from "../../../../infrastructure/repositories/books.repository";
import { eq, SQL } from "drizzle-orm";
import { booksTable } from "@/shared/infrastructure/database/schema/books.table";
import { BookNotFoundException } from "@/modules/books/domain/exceptions/book-not-found.exception";

export interface GetBookDetailsQueryHandler extends IQueryHandler<GetBookDetailsQuery> { }

@QueryHandler(GetBookDetailsQuery)
export class GetBookDetailsQueryHandlerImpl implements GetBookDetailsQueryHandler {
    constructor(
        @InjectBooksRepository() private readonly booksRepository: BooksRepository
    ) { }

    async execute({ query }: GetBookDetailsQuery): Promise<GetBookDetailsQueryResult> {

        let whereCondition: SQL
        if (query.type === GetBookDetailsQueryType.ID) {
            whereCondition = eq(booksTable.id, query.bookId)
        }
        else {
            whereCondition = eq(booksTable.slug, query.bookSlug)
        }

        const book = await this.booksRepository.findBookByWhereWithAuthorAndCategories(whereCondition);

        if (!book) {
            throw new BookNotFoundException();
        }

        return book;
    }
}

export const GetBookDetailsQueryHandlerToken = Symbol("GetBookDetailsQueryHandler");

export const GetBookDetailsQueryHandlerProvider: Provider = {
    provide: GetBookDetailsQueryHandlerToken,
    useClass: GetBookDetailsQueryHandlerImpl
}
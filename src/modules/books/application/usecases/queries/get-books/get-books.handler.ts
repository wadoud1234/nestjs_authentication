import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetBooksQuery } from "./get-books.query";
import { GetBooksQueryResult } from "./get-books.result";
import { Database, InjectDatabase } from "@/shared/infrastructure/database/database.module";
import { asc, ilike, or } from "drizzle-orm";
import { booksTable } from "@/shared/infrastructure/database/schema/books.table";
import { BookWithAuthorAndCategoryResponsePayload } from "@/modules/books/presentation/contracts/responses/book-with-author-and-category.response";
import { Provider } from "@nestjs/common";

export interface GetBooksQueryHandler extends IQueryHandler<GetBooksQuery> {

}

@QueryHandler(GetBooksQuery)
export class GetBooksQueryHandlerImpl implements GetBooksQueryHandler {
    constructor(
        @InjectDatabase() private readonly database: Database
    ) { }

    async execute({ page, size, offset, search }: GetBooksQuery): Promise<GetBooksQueryResult> {
        const whereCondition = search.trim().length > 0 ? or(ilike(booksTable.title, `%${search}%`),ilike(booksTable.description,`%${search}%`)) : undefined

        const books = await this.database.query.booksTable.findMany({
            limit: size,
            offset,
            where: whereCondition,
            orderBy: asc(booksTable.createdAt),
            with: {
                author: {
                    columns: {
                        id: true,
                        name: true
                    }
                },
                categories: {
                    with: {
                        category: {
                            columns: {
                                id: true,
                                name: true
                            }
                        }
                    }
                },
            }
        })

        const booksCount = await this.database.$count(booksTable)

        let formattedBooks: BookWithAuthorAndCategoryResponsePayload[] = books.map(book => ({
            ...book,
            categories: book.categories.map(category => category.category)
        }));

        return {
            values: formattedBooks,
            page,
            size,
            numberOfPages: Math.floor(booksCount / page),
            numberOfValues: booksCount
        }
    }
}

export const GetBooksQueryHandlerToken = Symbol("GetBooksQueryHandler")

export const GetBooksQueryHandlerProvider: Provider = {
    provide: GetBooksQueryHandlerToken,
    useClass: GetBooksQueryHandlerImpl
}
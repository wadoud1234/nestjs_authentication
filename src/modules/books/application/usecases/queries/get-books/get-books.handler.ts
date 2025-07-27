import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetBooksQuery } from "./get-books.query";
import { GetBooksQueryResult } from "./get-books.result";
import { Database, InjectDatabase } from "@/shared/infrastructure/database/database.module";
import { asc, ilike, or, SQL, inArray, and, between, gte, desc, ne, eq } from "drizzle-orm";
import { booksTable } from "@/shared/infrastructure/database/schema/books.table";
import { BookWithAuthorAndCategoryResponsePayload } from "@/modules/books/presentation/contracts/responses/book-with-author-and-category.response";
import { Provider } from "@nestjs/common";
import { usersTable } from "@/shared/infrastructure/database/schema/users.table";
import { bookCategoriesTable } from "@/shared/infrastructure/database/schema/books_categories.table";
import { BooksSortOrder } from "@/modules/books/presentation/contracts/requests/get-books.request";

export interface GetBooksQueryHandler extends IQueryHandler<GetBooksQuery> {

}

@QueryHandler(GetBooksQuery)
export class GetBooksQueryHandlerImpl implements GetBooksQueryHandler {
    constructor(
        @InjectDatabase() private readonly database: Database
    ) { }

    async execute({ page, size, offset, search, categoryIds, minPrice, maxPrice, authorName, sortBy, sortOrder, excludeBookId, isPublished }: GetBooksQuery): Promise<GetBooksQueryResult> {
        const whereConditions: (SQL | undefined)[] = []

        if (search?.trim().length > 0) {
            whereConditions.push(
                or(
                    ilike(booksTable.title, `%${search}%`),
                    ilike(booksTable.description, `%${search}%`)
                )!
            );
        }

        if (authorName?.trim().length > 0) {
            const authorsIds = (await this.database.query.usersTable.findMany({
                where: ilike(usersTable.name, `%${authorName}%`),
                columns: { id: true }
            })).map(author => author.id);

            if (authorsIds.length > 0) {
                whereConditions.push(inArray(booksTable.authorId, authorsIds));
            } else {
                // No authors found → return empty result
                return {
                    values: [],
                    page,
                    size,
                    numberOfPages: 0,
                    numberOfValues: 0
                };
            }
        }

        if (minPrice >= 0) {
            if (maxPrice && maxPrice >= minPrice) {
                whereConditions.push(between(booksTable.price, minPrice.toString(), maxPrice.toString()));
            } else {
                whereConditions.push(gte(booksTable.price, minPrice.toString()));
            }
        }

        // this is the hardest if you read my comment help me hahaha 
        if (Array.isArray(categoryIds) && categoryIds.length > 0) {
            const booksIds = (await this.database.query.bookCategoriesTable.findMany({
                where: inArray(bookCategoriesTable.categoryId, categoryIds),
                columns: { bookId: true }
            })).map(rel => rel.bookId);

            if (booksIds.length > 0) {
                whereConditions.push(inArray(booksTable.id, booksIds));
            } else {
                // No matching books → return empty result
                return {
                    values: [],
                    page,
                    size,
                    numberOfPages: 0,
                    numberOfValues: 0
                };
            }
        }

        const sortColumnMap = {
            title: booksTable.title,
            price: booksTable.price,
            rating: booksTable.rating,
            createdAt: booksTable.createdAt
        };

        const sortColumn = sortColumnMap[sortBy] || booksTable.createdAt;
        const orderFunction = sortOrder === BooksSortOrder.DESC ? desc : asc;

        if (excludeBookId.trim().length > 0) {
            whereConditions.push(ne(booksTable.id, excludeBookId))
        }

        if (isPublished === true) {
            whereConditions.push(eq(booksTable.isPublished, true))
        }
        else if (isPublished === false) {
            whereConditions.push(eq(booksTable.isPublished, false))
        }

        const books = await this.database.query.booksTable.findMany({
            limit: size,
            offset,
            where: whereConditions.length > 0 ? and(...whereConditions) : undefined,
            orderBy: orderFunction(sortColumn),
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
                }
            }
        });

        const booksCount = await this.database.$count(booksTable, whereConditions.length > 0 ? and(...whereConditions) : undefined);

        const formattedBooks: BookWithAuthorAndCategoryResponsePayload[] = books.map(book => ({
            ...book,
            categories: book.categories.map(c => c.category)
        }));

        return {
            values: formattedBooks,
            page,
            size,
            numberOfPages: Math.ceil(booksCount / size),
            numberOfValues: booksCount
        };
    }
}

export const GetBooksQueryHandlerToken = Symbol("GetBooksQueryHandler")

export const GetBooksQueryHandlerProvider: Provider = {
    provide: GetBooksQueryHandlerToken,
    useClass: GetBooksQueryHandlerImpl
}
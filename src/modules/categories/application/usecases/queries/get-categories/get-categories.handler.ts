import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetCategoriesQuery } from "./get-categories.query";
import { GetCategoriesQueryResult } from "./get-categories.result";
import { Provider } from "@nestjs/common";
import { Database, InjectDatabase } from "@/shared/infrastructure/database/database.module";
import { categoriesTable } from "@/shared/infrastructure/database/schema/books/categories.table";
import { asc } from "drizzle-orm";

export interface GetCategoriesQueryHandler extends IQueryHandler<GetCategoriesQuery> { }

@QueryHandler(GetCategoriesQuery)
export class GetCategoriesQueryHandlerImpl implements GetCategoriesQueryHandler {
    constructor(
        @InjectDatabase() private readonly database: Database
    ) { }

    async execute({ offset, page, size }: GetCategoriesQuery): Promise<GetCategoriesQueryResult> {
        const categories = await this.database.query.categoriesTable.findMany({
            limit: size,
            offset,
            orderBy: asc(categoriesTable.createdAt)
        })

        const categoriesCount = await this.database.$count(categoriesTable)

        return {
            values: categories,
            page,
            size,
            numberOfPages: Math.ceil(categoriesCount / size),
            numberOfValues: categoriesCount
        }
    }
}

export const GetCategoriesQueryHandlerToken = Symbol("GetCategoriesQueryHandler")

export const GetCategoriesQueryHandlerProvider: Provider = {
    provide: GetCategoriesQueryHandlerToken,
    useClass: GetCategoriesQueryHandlerImpl
}
import { Controller, Get, Query } from "@nestjs/common";
import { QueryBus } from "@nestjs/cqrs";
import { GetCategoriesQuery } from "../../application/usecases/queries/get-categories/get-categories.query";

@Controller("categories")
export class CategoriesQueriesController {

    constructor(
        private readonly queryBus: QueryBus
    ) { }

    // GET CATEGORIES BY PAGINATION
    @Get()
    async getPaginated(
        @Query("page") page: number = 1,
        @Query("size") size: number = 10
    ) {
        return {
            data: await this.queryBus.execute(new GetCategoriesQuery(page, size))
        }
    }
}
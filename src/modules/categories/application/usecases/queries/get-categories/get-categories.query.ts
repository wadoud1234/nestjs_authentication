import { Query } from "@nestjs/cqrs";
import { GetCategoriesQueryResult } from "./get-categories.result";

export class GetCategoriesQuery extends Query<GetCategoriesQueryResult> {
    constructor(
        public readonly page: number,
        public readonly size: number
    ) {
        super()
    }

    get offset() {
        return (this.page - 1) * this.size;
    }
}
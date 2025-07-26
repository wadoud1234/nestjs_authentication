import { IQuery, Query } from "@nestjs/cqrs";
import { GetBooksQueryResult } from "./get-books.result";

export class GetBooksQuery extends Query<GetBooksQueryResult> {
    constructor(
        public readonly page: number,
        public readonly size: number,
        public readonly search: string
    ) {
        super()
    }

    get offset() {
        return (this.page - 1) * this.size
    }
}
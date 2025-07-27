import { Controller } from "@nestjs/common";
import { QueryBus } from "@nestjs/cqrs";

@Controller("reviews")
export class ReviewsQueriesController {

    constructor(
        private readonly queryBus: QueryBus
    ) { }

}
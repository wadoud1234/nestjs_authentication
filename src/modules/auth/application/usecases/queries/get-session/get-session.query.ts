import { Query } from "@nestjs/cqrs";
import { GetSessionResult } from "./get-session.result";

export class GetSessionQuery extends Query<GetSessionResult> {
    constructor(
        public readonly userId: string
    ) {
        super()
    }
}
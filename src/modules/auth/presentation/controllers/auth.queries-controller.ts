import { Controller, Get } from "@nestjs/common";
import { Public } from "../decorators/is-public.decorator";
import { CurrentUser } from "../decorators/current-user.decorator";
import { UserResponse, UserResponsePayload } from "@/modules/users/presentation/contracts/responses/user.response";
import { GetSessionQuery } from "../../application/usecases/queries/get-session/get-session.query";
import { QueryBus } from "@nestjs/cqrs";

@Controller("auth")
export class AuthQueriesController {

    constructor(
        private readonly queryBus: QueryBus
    ) { }

    @Get("/session")
    async getSession(@CurrentUser() user: UserResponsePayload): Promise<UserResponse> {
        return {
            data: await this.queryBus.execute(new GetSessionQuery(user.id))
        }
    }
}

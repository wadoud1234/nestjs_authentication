import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetSessionQuery } from "./get-session.query";
import { GetSessionResult } from "./get-session.result";
import { Database, InjectDatabase } from "@/shared/infrastructure/database/database.module";
import { usersTable } from "@/shared/infrastructure/database/schema/identity/users.table";
import { eq } from "drizzle-orm";
import { Provider, UnauthorizedException } from "@nestjs/common";
import { InjectUsersRepository, UsersRepository } from "@/modules/users/infrastructure/repositories/users.repository";

export interface GetSessionHandlerImpl extends IQueryHandler<GetSessionQuery> { }

@QueryHandler(GetSessionQuery)
export class GetSessionHandlerImpl implements GetSessionHandlerImpl {
    constructor(
        @InjectUsersRepository() private readonly usersRepository: UsersRepository
    ) { }

    async execute({ userId }: GetSessionQuery): Promise<GetSessionResult> {
        const user = await this.usersRepository.findUserByWhereAsUserResponse(eq(usersTable.id, userId));
        if (!user || !user.id) throw new UnauthorizedException();

        return user;
    }
}

export const GetSessionHandlerToken = Symbol("GetSessionHandler")

export const GetSessionHandlerProvider: Provider = {
    provide: GetSessionHandlerToken,
    useClass: GetSessionHandlerImpl
}
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetSessionQuery } from "./get-session.query";
import { GetSessionResult } from "./get-session.result";
import { Database, InjectDatabase } from "@/shared/infrastructure/database/database.module";
import { usersTable } from "@/shared/infrastructure/database/schema/users.table";
import { eq } from "drizzle-orm";
import { Provider, UnauthorizedException } from "@nestjs/common";

@QueryHandler(GetSessionQuery)
export class GetSessionHandler implements IQueryHandler<GetSessionQuery> {
    constructor(
        @InjectDatabase() private readonly database: Database
    ) { }

    async execute({ userId }: GetSessionQuery): Promise<GetSessionResult> {
        const [user] = await this.database
            .select({
                id: usersTable.id,
                email: usersTable.email,
                name: usersTable.name,
                role: usersTable.role
            })
            .from(usersTable)
            .where(eq(usersTable.id, userId))
            .limit(1)
        if (!user || !user.id) throw new UnauthorizedException();

        return user;
    }
}

export const GetSessionHandlerToken = Symbol("GetSessionHandler")

export const GetSessionHandlerProvider: Provider = {
    provide: GetSessionHandlerToken,
    useClass: GetSessionHandler
}
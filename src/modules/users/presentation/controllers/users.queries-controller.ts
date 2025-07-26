import { Public } from "@/modules/auth/presentation/decorators/is-public.decorator";
import { Database, InjectDatabase } from "@/shared/infrastructure/database/database.module";
import { usersTable } from "@/shared/infrastructure/database/schema/users.table";
import { Controller, Get } from "@nestjs/common";

@Controller("users")
export class UsersQueriesController {
    constructor(
        @InjectDatabase() private readonly database: Database
    ) { }

    @Public()
    @Get()
    async hello() {
        // await this.db.update(usersTable).set({
        //     role: UserRole.ADMIN
        // }).where(eq(usersTable.email, "abdelouadoud12@email.com"))
        return { data: await this.database.select().from(usersTable) }
    }
}
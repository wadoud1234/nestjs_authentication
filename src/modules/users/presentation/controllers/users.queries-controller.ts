import { Database, InjectDatabase } from "@/shared/infrastructure/database/database.module";
import { userRolesTable } from "@/shared/infrastructure/database/schema/identity";
import { Controller, Get } from "@nestjs/common";

@Controller("users")
export class UsersQueriesController {
    constructor(
        @InjectDatabase() private readonly database: Database
    ) { }

    @Get("HELLO")
    async hello() {
        // await this.db.update(usersTable).set({
        //     role: UserRole.ADMIN
        // }).where(eq(usersTable.email, "abdelouadoud12@email.com"))
        await this.database.insert(userRolesTable).values({
            roleId: "4e62b3dc-2294-409c-a05e-3db14e79e6b5",
            userId: "2fab5795-605e-4bcf-8674-d2a0d659ad48"
        })

        await this.database.insert(userRolesTable).values({
            roleId: "4d6f48b5-0807-424c-bad4-a8bacd7039fe",
            userId: "2fab5795-605e-4bcf-8674-d2a0d659ad48"
        })
        return {
            data: await this.database.query.rolesTable.findMany({
                with: {
                    rolePermissions: {
                        with: {
                            permission: true
                        }
                    }
                }
            })
        }
    }
}

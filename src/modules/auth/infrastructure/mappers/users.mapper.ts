import { UserResponsePayload } from "@/modules/users/presentation/contracts/responses/user.response";
import { usersTable } from "@/shared/infrastructure/database/schema/users.table";
import { PgColumn } from "drizzle-orm/pg-core";

export class UserDatabaseMapper {
    static get mapDatabaseReturnToUserResponse() {
        return {
            id: usersTable.id,
            email: usersTable.email,
            name: usersTable.name,
            role: usersTable.role
        } as const
    }

    static get selectUserResponse() {
        return {
            id: true,
            email: true,
            name: true,
            role: true
        } as const
    }
}

// export const UserResponseFromUsersTable: { [K in keyof UserResponsePayload]: PgColumn } = {
//     id: usersTable.id,
//     email: usersTable.email,
//     name: usersTable.name,
//     role: usersTable.role
// }
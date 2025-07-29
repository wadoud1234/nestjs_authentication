import { Database, InjectDatabase } from "@/shared/infrastructure/database/database.module";
import { DatabaseTransaction } from "@/shared/infrastructure/database/providers/transaction-manager.provider";
import { Inject, Injectable, Provider } from "@nestjs/common";
import { UserEntity } from "../../domain/entities/user.entity";
import { UserRole } from "../../domain/enums/user-role.enum";
import { eq } from "drizzle-orm";
import { rolesTable, userRolesTable } from "@/shared/infrastructure/database/schema/identity";
import { CreateRoleInput, RolesTable } from "@/shared/infrastructure/database/schema/identity/roles.table";

export interface UserRolesRepository {
    getRoleId(roleName: UserRole, tx: DatabaseTransaction): Promise<string>
    getRoleId(roleName: UserRole, tx: void): Promise<string>

    createRole(roleName: UserRole, tx: DatabaseTransaction): Promise<RolesTable>
    createRole(roleName: UserRole, tx: void): Promise<RolesTable>

    addRoleToUser(userId: string, roleId: string, tx: DatabaseTransaction): Promise<void>
    addRoleToUser(userId: string, roleId: string, tx: void): Promise<void>
}

@Injectable()
export class UserRolesRepositoryImpl implements UserRolesRepository {

    constructor(
        @InjectDatabase() private readonly database: Database
    ) { }

    async getRoleId(roleName: UserRole, tx: DatabaseTransaction | void): Promise<string> {
        let role = await (tx || this.database).query.rolesTable.findFirst({
            where: eq(rolesTable.name, roleName)
        })

        if (!role) {
            role = await this.createRole(roleName)
        }
        return role.id
    }

    async createRole(roleName: UserRole, tx: DatabaseTransaction | void): Promise<RolesTable> {
        return await (tx || this.database)
            .insert(rolesTable)
            .values({ name: roleName })
            .returning()
            .then(r => r?.[0])
    }

    async addRoleToUser(userId: string, roleId: string, tx: DatabaseTransaction | void): Promise<void> {
        await (tx || this.database).insert(userRolesTable).values({
            roleId,
            userId
        })
    }
}

export const UserRolesRepositoryToken = Symbol("UserRolesRepository")

export const InjectUserRolesRepository = () => Inject(UserRolesRepositoryToken);

export const UserRolesRepositoryProvider: Provider = {
    provide: UserRolesRepositoryToken,
    useClass: UserRolesRepositoryImpl
}

export interface CreateUserInput extends Pick<UserEntity, "email" | "password" | "name"> { }
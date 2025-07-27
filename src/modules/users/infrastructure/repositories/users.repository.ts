import { Database, InjectDatabase } from "@/shared/infrastructure/database/database.module";
import { DatabaseTransaction } from "@/shared/infrastructure/database/providers/transaction-manager.provider";
import { Inject, Injectable, Provider } from "@nestjs/common";
import { SQL } from "drizzle-orm";
import { UserResponsePayload } from "../../presentation/contracts/responses/user.response";
import { usersTable } from "@/shared/infrastructure/database/schema/users.table";
import { UserEntity } from "../../domain/entities/user.entity";

export interface UsersRepository {
    isUserExistByWhere(where: SQL, tx: DatabaseTransaction): Promise<false | { id: string; }>
    isUserExistByWhere(where: SQL, tx: void): Promise<false | { id: string; }>

    findUserByWhereAsUserResponse(where: SQL, tx: DatabaseTransaction): Promise<UserResponsePayload | null>
    findUserByWhereAsUserResponse(where: SQL, tx: void): Promise<UserResponsePayload | null>

    findUserByWhereAsUserResponseAndPassword(where: SQL, tx: DatabaseTransaction | void): Promise<UserResponsePayload & { password: string } | null>
    findUserByWhereAsUserResponseAndPassword(where: SQL, tx: DatabaseTransaction | void): Promise<UserResponsePayload & { password: string } | null>

    createUser(input: CreateUserInput, tx: void): Promise<UserResponsePayload>
    createUser(input: CreateUserInput, tx: DatabaseTransaction): Promise<UserResponsePayload>
}

@Injectable()
export class UsersRepositoryImpl implements UsersRepository {

    constructor(
        @InjectDatabase() private readonly database: Database
    ) { }

    async isUserExistByWhere(where: SQL, tx: DatabaseTransaction | void): Promise<false | { id: string; }> {
        const user = await (tx || this.database).query.usersTable.findFirst({
            where,
            columns: {
                id: true
            }
        })
        if (!user || !user.id) return false
        return user
    }

    async findUserByWhereAsUserResponse(where: SQL, tx: DatabaseTransaction | void): Promise<UserResponsePayload | null> {
        const user = await (tx || this.database).query.usersTable.findFirst({
            where,
            columns: {
                id: true,
                email: true,
                name: true,
                role: true
            },
        })
        if (!user || !user.id) {
            return null
        }
        return user
    }

    async findUserByWhereAsUserResponseAndPassword(where: SQL, tx: DatabaseTransaction | void): Promise<UserResponsePayload & { password: string } | null> {
        const user = await (tx || this.database).query.usersTable.findFirst({
            where,
            columns: {
                id: true,
                email: true,
                name: true,
                role: true,
                password: true
            },
        })
        if (!user || !user.id) {
            return null
        }
        return user
    }

    async createUser(input: CreateUserInput, tx: DatabaseTransaction | void): Promise<UserResponsePayload> {
        return await this.database
            .insert(usersTable)
            .values({
                name: input.name,
                email: input.email,
                password: input.password
            })
            .returning({
                id: usersTable.id,
                email: usersTable.email,
                name: usersTable.name,
                role: usersTable.role
            }).then(r => r?.[0])

    }
}

export const UsersRepositoryToken = Symbol("UsersRepository")

export const InjectUsersRepository = () => Inject(UsersRepositoryToken);

export const UsersRepositoryProvider: Provider = {
    provide: UsersRepositoryToken,
    useClass: UsersRepositoryImpl
}

export interface CreateUserInput extends Pick<UserEntity, "email" | "password" | "name"> { }
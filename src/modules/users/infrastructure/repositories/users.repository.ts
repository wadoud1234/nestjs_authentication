import { Database, InjectDatabase } from "@/shared/infrastructure/database/database.module";
import { DatabaseTransaction } from "@/shared/infrastructure/database/providers/transaction-manager.provider";
import { Inject, Injectable, Provider } from "@nestjs/common";
import { SQL } from "drizzle-orm";
import { UserResponsePayload } from "../../presentation/contracts/responses/user.response";
import { usersTable } from "@/shared/infrastructure/database/schema/identity/users.table";
import { UserEntity } from "../../domain/entities/user.entity";
import { InjectUserRolesRepository, UserRolesRepository } from "./user-roles.repository";
import { UserAuthPayload } from "../../presentation/contracts/responses/user-auth.payload";

export interface UsersRepository {
    isUserExistByWhere(where: SQL, tx: DatabaseTransaction): Promise<false | { id: string; }>
    isUserExistByWhere(where: SQL, tx: void): Promise<false | { id: string; }>

    findUserByWhereAsUserResponse(where: SQL, tx: DatabaseTransaction): Promise<UserAuthPayload | null>
    findUserByWhereAsUserResponse(where: SQL, tx: void): Promise<UserAuthPayload | null>

    findUserByWhereAsUserResponseAndPassword(where: SQL, tx: DatabaseTransaction | void): Promise<(UserAuthPayload & { password: string }) | null>
    findUserByWhereAsUserResponseAndPassword(where: SQL, tx: DatabaseTransaction | void): Promise<(UserAuthPayload & { password: string }) | null>

    createUser(input: CreateUserInput, tx: void): Promise<{ id: string }>
    createUser(input: CreateUserInput, tx: DatabaseTransaction): Promise<{ id: string }>
}

@Injectable()
export class UsersRepositoryImpl implements UsersRepository {

    constructor(
        @InjectDatabase() private readonly database: Database,
        @InjectUserRolesRepository() private readonly userRolesRepository: UserRolesRepository
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

    async findUserByWhereAsUserResponse(where: SQL, tx: DatabaseTransaction | void): Promise<UserAuthPayload | null> {
        const user = await (tx || this.database).query.usersTable.findFirst({
            where,
            columns: {
                id: true,
                email: true,
                name: true,
            },
            with: {
                roles: {
                    columns: {},
                    with: {
                        role: {
                            columns: {
                                name: true
                            },
                            with: {
                                rolePermissions: {
                                    columns: {},
                                    with: {
                                        permission: {
                                            columns: {
                                                name: true
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        })

        if (!user || !user.id) {
            return null
        }
        const { id, email, name, roles } = user

        const formattedUser = {
            id,
            email,
            name,
            roles: roles.map((r) => r.role.name), // ['USER', 'AUTHOR', ...]
            permissions: [
                ...new Set(
                    roles.flatMap((r) =>
                        r.role.rolePermissions.map((rp) => rp.permission.name)
                    )
                ),
            ], // deduplicated permission names
        };

        return formattedUser
    }

    async findUserByWhereAsUserResponseAndPassword(where: SQL, tx: DatabaseTransaction | void): Promise<UserAuthPayload & { password: string } | null> {
        const user = await (tx || this.database).query.usersTable.findFirst({
            where,
            columns: {
                id: true,
                email: true,
                name: true,
                password: true
            },
            with: {
                roles: {
                    columns: {},
                    with: {
                        role: {
                            columns: {
                                name: true
                            },
                            with: {
                                rolePermissions: {
                                    columns: {},
                                    with: {
                                        permission: {
                                            columns: {
                                                name: true
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        })


        if (!user || !user.id) {
            return null
        }

        const { id, email, roles, name, password } = user
        const formattedUser = {
            id,
            email,
            name,
            password,
            roles: roles.map((r) => r.role.name), // ['USER', 'AUTHOR', ...]
            permissions: [
                ...new Set(
                    roles.flatMap((r) =>
                        r.role.rolePermissions.map((rp) => rp.permission.name)
                    )
                ),
            ], // deduplicated permission names
        };

        return formattedUser
    }

    async createUser(input: CreateUserInput, tx: DatabaseTransaction | void): Promise<{ id: string }> {
        return await (tx || this.database)
            .insert(usersTable)
            .values({
                name: input.name,
                email: input.email,
                password: input.password,
            })
            .returning({ id: usersTable.id }).then(r => r?.[0])

    }
}

export const UsersRepositoryToken = Symbol("UsersRepository")

export const InjectUsersRepository = () => Inject(UsersRepositoryToken);

export const UsersRepositoryProvider: Provider = {
    provide: UsersRepositoryToken,
    useClass: UsersRepositoryImpl
}

export interface CreateUserInput extends Pick<UserEntity, "email" | "password" | "name"> { }
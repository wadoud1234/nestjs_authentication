import { Inject, Injectable, Provider } from "@nestjs/common";
import { BaseRepositoryAbstract } from "@/shared/infrastructure/repositories/base.repository-abstract";
import { DatabaseService, InjectDatabase } from "@/shared/infrastructure/database/database.module";
import { and, eq, InferColumnsDataTypes, SQL } from "drizzle-orm";
import { CreateUserInput, usersTable, UsersTable } from "@/shared/infrastructure/database/schema/users.table";
import { PgDeleteBase, PgInsertBuilder, PgTable, PgTableWithColumns, PgUpdateBuilder, TableConfig } from "drizzle-orm/pg-core";
import { NodePgQueryResultHKT } from "drizzle-orm/node-postgres";
import schema from "@/shared/infrastructure/database/schema";

export interface UsersRepository {
    findAll(): Promise<UsersTable[]>

    // Find One By Id
    findOneById<TColumns extends UsersTableSelectColumns>
        (id: string, options: { columns: TColumns, where?: SQL }): Promise<UsersTableSelectedColumns<TColumns, UsersTable> | null>
    findOneById(id: string, options: { columns: null, where?: SQL }): Promise<UsersTable | null>

    // Find One By Email
    findOneByEmail<TColumns extends UsersTableSelectColumns>
        (email: string, options: { columns: TColumns, where?: SQL }): Promise<UsersTableSelectedColumns<TColumns, UsersTable> | null>
    findOneByEmail(email: string, options: { columns: null, where?: SQL }): Promise<UsersTable | null>,

    // Create
    insertBuilder: PgInsertBuilder<typeof usersTable, NodePgQueryResultHKT, false>

    // Update
    updateBuilder: PgUpdateBuilder<typeof usersTable, NodePgQueryResultHKT>

    // Delete
    deleteBuilder: PgDeleteBase<typeof usersTable, NodePgQueryResultHKT>
}

const UsersRepositoryToken = Symbol("UsersRepository");

let t: { [key in keyof UsersTable]?: UsersTable[key] extends null ? void : UsersTable[key] };

type UsersTableSelectColumns = { [key in keyof UsersTable]?: boolean | undefined }
type UsersTableSelectedColumns<TColumns extends UsersTableSelectColumns, UsersTable
> = { [K in keyof TColumns & keyof UsersTable as TColumns[K] extends true ? K : never]: UsersTable[K] }

@Injectable()
export class UsersRepositoryImpl
    extends BaseRepositoryAbstract<typeof usersTable>
    implements UsersRepository {
    constructor(@InjectDatabase() db: DatabaseService) {
        super(db, usersTable);
    }

    async findAll(): Promise<UsersTable[]> {
        return this.getDbContext().select().from(this.table)
    }

    async findOneById<TColumns extends UsersTableSelectColumns>
        (id: string, options: { columns: TColumns, where?: SQL }): Promise<UsersTableSelectedColumns<TColumns, UsersTable> | null>
    async findOneById(id: string, options: { columns: null, where?: SQL }): Promise<UsersTable | null> {
        if (options.columns) {
            const user = await this.getDbContext().query.usersTable.findFirst({
                where: options.where ? and(eq(this.table.id, id), options.where) : eq(this.table.id, id),
                columns: options.columns,
            })
            if (!user) return null;
            return user;
        }
        const user = await this.getDbContext().query.usersTable.findFirst({
            where: options.where ? and(eq(this.table.id, id), options.where) : eq(this.table.id, id),
        })
        if (!user) return null;
        return user;
    }

    async findOneByEmail<TColumns extends UsersTableSelectColumns>
        (email: string, columns: TColumns): Promise<UsersTableSelectedColumns<TColumns, UsersTable> | null>
    async findOneByEmail(email: string, columns: null): Promise<UsersTable | null> {
        if (columns) {
            const user = await this.getDbContext().query.usersTable.findFirst({
                where: eq(this.table.email, email),
                columns
            })
            if (!user) return null;
            return user;

        }
        const user = await this.getDbContext().query.usersTable.findFirst({
            where: eq(this.table.email, email),
        })
        if (!user) return null;
        return user;
    }

    get insertBuilder(): PgInsertBuilder<typeof this.table, NodePgQueryResultHKT, false> {
        return this.getDbContext().insert(this.table);
    }

    get updateBuilder(): PgUpdateBuilder<typeof this.table, NodePgQueryResultHKT> {
        return this.getDbContext().update(this.table);
    }

    get deleteBuilder(): PgDeleteBase<typeof this.table, NodePgQueryResultHKT> {
        return this.getDbContext().delete(this.table)
    }
}

export const InjectUsersRepository = () => Inject(UsersRepositoryToken)

export const UsersRepositoryProvider: Provider = {
    provide: UsersRepositoryToken,
    useClass: UsersRepositoryImpl
}
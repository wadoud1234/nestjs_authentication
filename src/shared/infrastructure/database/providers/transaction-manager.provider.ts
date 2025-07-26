import { Injectable } from "@nestjs/common";
import { Database, InjectDatabase } from "../database.module";

export type DatabaseTransaction = Parameters<
    Parameters<Database['transaction']>[0]
>[0];

@Injectable()
export class TransactionManager {
    constructor(
        @InjectDatabase()
        private readonly db: Database,
    ) { }

    async runInTransaction<T>(
        callback: (tx: DatabaseTransaction) => Promise<T>,
    ): Promise<T> {
        return this.db.transaction(callback);
    }

    getDatabase(): Database {
        return this.db;
    }
}
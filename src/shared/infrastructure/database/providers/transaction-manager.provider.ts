import { Injectable } from "@nestjs/common";
import { DatabaseService, InjectDatabase } from "../database.module";

export type DatabaseTransaction = Parameters<
    Parameters<DatabaseService['transaction']>[0]
>[0];

@Injectable()
export class TransactionManager {
    constructor(
        @InjectDatabase()
        private readonly db: DatabaseService,
    ) { }

    async runInTransaction<T>(
        callback: (tx: DatabaseTransaction) => Promise<T>,
    ): Promise<T> {
        return this.db.transaction(callback);
    }

    getDatabase(): DatabaseService {
        return this.db;
    }
}
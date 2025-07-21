import { DatabaseService, InjectDatabase } from "../database/database.module";
import { DatabaseTransaction } from "../database/providers/transaction-manager.provider";

export abstract class BaseRepositoryAbstract<Table> {
    constructor(
        @InjectDatabase()
        protected readonly db: DatabaseService,
        protected readonly table: Table,
    ) { }

    protected getDbContext(tx?: DatabaseTransaction) {
        return tx || this.db;
    }
}
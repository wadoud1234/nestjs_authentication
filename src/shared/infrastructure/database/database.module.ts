import { Global, Inject, Module } from "@nestjs/common";
import { Pool } from "pg";
import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import schema from "./schema";
import { AppConfigService, AppConfigServiceToken } from "../config/app-config.service";
import { AppConfigModule } from "../config/config.module";

const DATABASE_SERVICE = Symbol("DATABASE_SERVICE");

export type DatabaseService = NodePgDatabase<typeof schema> & {
    $client: Pool;
}

export const InjectDatabase = () => Inject(DATABASE_SERVICE);

@Global()
@Module({
    imports: [AppConfigModule],
    providers: [
        {
            provide: DATABASE_SERVICE,
            inject: [AppConfigServiceToken],
            useFactory: (appConfig: AppConfigService): DatabaseService => {
                const databaseUrl = appConfig.DATABASE_URL;
                const pool = new Pool({
                    connectionString: databaseUrl,
                });

                return drizzle(pool, {
                    schema,
                    casing: "snake_case"
                }) as DatabaseService
            }
        }
    ],
    exports: [DATABASE_SERVICE]
})
export class DatabaseModule { }


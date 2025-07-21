import { Global, Inject, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Pool } from "pg";
import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import schema from "./schema";

const DATABASE_SERVICE = Symbol("DATABASE_SERVICE");

export type DatabaseService = NodePgDatabase<typeof schema> & {
    $client: Pool;
}

export const InjectDatabase = () => Inject(DATABASE_SERVICE);

@Global()
@Module({
    providers: [
        {
            provide: DATABASE_SERVICE,
            inject: [ConfigService],
            useFactory: (configService: ConfigService): DatabaseService => {
                const databaseUrl = configService.get<string>("DATABASE_URL")!;
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


import { timestamp, uuid } from "drizzle-orm/pg-core";

export const timestamps = {
    updated_at: timestamp(),
    created_at: timestamp().defaultNow().notNull(),
    deleted_at: timestamp(),
}

export const id = (name: string) => uuid(name).defaultRandom().notNull()
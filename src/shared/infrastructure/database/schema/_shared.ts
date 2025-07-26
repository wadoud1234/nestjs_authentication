import { timestamp, uuid } from "drizzle-orm/pg-core";

export const timestamps = {
    updatedAt: timestamp("updated_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
}

export const id = (name: string) => uuid(name).defaultRandom().notNull()
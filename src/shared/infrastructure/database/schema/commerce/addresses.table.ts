import { boolean, pgTable, varchar } from "drizzle-orm/pg-core";
import { id, timestamps } from "../_shared";
import { usersTable } from "../identity/users.table";
import { InferInsertModel, InferSelectModel, relations } from "drizzle-orm";
import { ordersTable } from "./orders.table";

export const addressesTable = pgTable("addresses", {
    id: id("id").primaryKey(),
    userId: id("user_id")
        .notNull()
        .references(() => usersTable.id, { onDelete: "cascade" }),
    street: varchar("street", { length: 255 }).notNull(),
    city: varchar("city", { length: 100 }).notNull(),
    state: varchar("state", { length: 100 }),
    postalCode: varchar("postal_code", { length: 20 }).notNull(),
    country: varchar("country", { length: 100 }).notNull(),
    isDefault: boolean("is_default").default(false).notNull(),
    ...timestamps
});

export const addressRelations = relations(addressesTable, ({ one, many }) => ({
    user: one(usersTable, {
        fields: [addressesTable.userId],
        references: [usersTable.id],
        relationName: "userAddresses"
    }),
    orders: many(ordersTable, {
        relationName: "addressOrders"
    })
}));

export type AddressesTable = InferSelectModel<typeof addressesTable>;
export type CreateAddressInput = InferInsertModel<typeof addressesTable>;
export type UpdateAddressInput = Partial<CreateAddressInput>;
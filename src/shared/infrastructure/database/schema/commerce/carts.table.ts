import { pgTable, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "../identity/users.table";
import { id } from "../_shared";
import { InferInsertModel, InferSelectModel, relations } from "drizzle-orm";
import { cartItemsTable } from "./cart-items.table";

export const cartsTable = pgTable("carts", {
    id: id("id").primaryKey(),
    userId: id("user_id")
        .notNull()
        .references(() => usersTable.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const cartRelations = relations(cartsTable, ({ one, many }) => ({
    user: one(usersTable, {
        fields: [cartsTable.userId],
        references: [usersTable.id],
        relationName: "userCart"
    }),
    items: many(cartItemsTable, {
        relationName: "cartItems"
    })
}));

export type CartsTable = InferSelectModel<typeof cartsTable>;
export type CreateCartInput = InferInsertModel<typeof cartsTable>;
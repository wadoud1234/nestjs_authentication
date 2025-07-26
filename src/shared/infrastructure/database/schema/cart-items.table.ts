import { pgTable, integer, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./users.table";
import { booksTable } from "./books.table";
import { id } from "./_shared";
import { InferInsertModel, InferSelectModel, relations } from "drizzle-orm";

export const cartItemsTable = pgTable("cart_items", {
    id: id("id").primaryKey(),
    userId: id("user_id")
        .notNull()
        .references(() => usersTable.id, { onDelete: "cascade" }),
    bookId: id("book_id")
        .notNull()
        .references(() => booksTable.id, { onDelete: "cascade" }),
    quantity: integer("quantity").notNull().default(1),
    addedAt: timestamp("added_at").defaultNow().notNull(),
});

export const cartItemRelations = relations(cartItemsTable, ({ one }) => ({
    user: one(usersTable, {
        fields: [cartItemsTable.userId],
        references: [usersTable.id],
        relationName: "userCartItems"
    }),
    book: one(booksTable, {
        fields: [cartItemsTable.bookId],
        references: [booksTable.id],
        relationName: "bookCartItems"
    })
}));

export type CartItem = InferSelectModel<typeof cartItemsTable>;
export type CreateCartItemInput = InferInsertModel<typeof cartItemsTable>;
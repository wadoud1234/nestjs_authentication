import { pgTable, integer, real } from "drizzle-orm/pg-core";
import { ordersTable } from "./orders.table";
import { booksTable } from "../books/books.table";
import { id } from "../_shared";
import { relations } from "drizzle-orm";

export const orderItemsTable = pgTable("order_items", {
    id: id("id").primaryKey(),
    orderId: id("order_id")
        .notNull()
        .references(() => ordersTable.id, { onDelete: "cascade" }),
    bookId: id("book_id")
        .notNull()
        .references(() => booksTable.id),
    quantity: integer("quantity").notNull(),
    priceAtOrder: real("price_at_order").notNull(), // Price when ordered
});

export const orderItemRelations = relations(orderItemsTable, ({ one }) => ({
    order: one(ordersTable, {
        fields: [orderItemsTable.orderId],
        references: [ordersTable.id],
        relationName: "orderItems"
    }),
    book: one(booksTable, {
        fields: [orderItemsTable.bookId],
        references: [booksTable.id],
        relationName: "bookOrderItems"
    })
}));
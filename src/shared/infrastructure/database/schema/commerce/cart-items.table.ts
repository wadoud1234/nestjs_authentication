import { pgTable, integer, timestamp, real, numeric } from "drizzle-orm/pg-core";
import { usersTable } from "../identity/users.table";
import { booksTable } from "../books/books.table";
import { id } from "../_shared";
import { InferInsertModel, InferSelectModel, relations } from "drizzle-orm";
import { cartsTable } from "./carts.table";

export const cartItemsTable = pgTable("cart_items", {
    id: id("id").primaryKey(),
    cartId: id("cart_id")
        .notNull()
        .references(() => cartsTable.id, { onDelete: "cascade" }),
    bookId: id("book_id")
        .notNull()
        .references(() => booksTable.id, { onDelete: "cascade" }),
    quantity: integer("quantity").notNull().default(1),
    addedAt: timestamp("added_at").defaultNow().notNull(),
    priceAtAdd: numeric("price_at_add", { precision: 10, scale: 2 }).notNull(), // Optional: price when added to cart
});

// Updated relations for cartItemsTable:
export const cartItemRelations = relations(cartItemsTable, ({ one }) => ({
    cart: one(cartsTable, {
        fields: [cartItemsTable.cartId],
        references: [cartsTable.id],
        relationName: "cartItems"
    }),
    book: one(booksTable, {
        fields: [cartItemsTable.bookId],
        references: [booksTable.id],
        relationName: "bookCartItems"
    })
}));

export type CartItem = InferSelectModel<typeof cartItemsTable>;
export type CreateCartItemInput = InferInsertModel<typeof cartItemsTable>;
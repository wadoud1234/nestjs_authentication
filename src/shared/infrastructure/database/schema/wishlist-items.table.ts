import { pgTable, timestamp } from "drizzle-orm/pg-core";
import { id } from "./_shared";
import { usersTable } from "./users.table";
import { booksTable } from "./books.table";
import { InferInsertModel, InferSelectModel, relations } from "drizzle-orm";

export const wishlistItemsTable = pgTable("wishlist_items", {
    id: id("id").primaryKey(),
    userId: id("user_id")
        .notNull()
        .references(() => usersTable.id, { onDelete: "cascade" }),
    bookId: id("book_id")
        .notNull()
        .references(() => booksTable.id, { onDelete: "cascade" }),
    addedAt: timestamp("added_at").defaultNow().notNull(),
});

export const wishlistItemRelations = relations(wishlistItemsTable, ({ one }) => ({
    user: one(usersTable, {
        fields: [wishlistItemsTable.userId],
        references: [usersTable.id],
        relationName: "userWishlistItems"
    }),
    book: one(booksTable, {
        fields: [wishlistItemsTable.bookId],
        references: [booksTable.id],
        relationName: "bookWishlistItems"
    })
}));

export type WishlistItem = InferSelectModel<typeof wishlistItemsTable>;
export type CreateWishlistItemInput = InferInsertModel<typeof wishlistItemsTable>;
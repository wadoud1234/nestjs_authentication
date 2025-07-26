import { boolean, index, integer, pgTable, real, text, uniqueIndex, varchar } from "drizzle-orm/pg-core";
import { id, timestamps } from "./_shared";
import { usersTable } from "./users.table";
import { InferInsertModel, InferSelectModel, relations } from "drizzle-orm";
import { reviewsTable } from "./reviews.table";
import { bookCategoriesTable } from "./books_categories.table";
import { orderItemsTable } from "./order-items.table";
import { cartItemsTable } from "./cart-items.table";
import { wishlistItemsTable } from "./wishlist-items.table";

export const booksTable = pgTable("books", {
    id: id("id").primaryKey(),
    title: varchar("title", { length: 255 }).notNull().unique(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    description: text("description").notNull().default(""),
    pages: integer("pages").default(0).notNull(),
    stock: integer("stock").notNull(),
    authorId: id("author_id").references(() => usersTable.id).notNull(),
    rating: real("raitng").default(0).notNull(),
    isbn: varchar("isbn", { length: 100 }).notNull(),
    isPublished: boolean("is_published").default(false).notNull(),
    ...timestamps,
}, (table) => [
    uniqueIndex("slug_idx").on(table.slug),
    index("title_idx").on(table.title),
])

export const bookRelations = relations(booksTable, ({ one, many }) => ({
    author: one(usersTable, {
        fields: [booksTable.authorId],
        references: [usersTable.id],
        relationName: "bookAuthor"
    }),
    reviews: many(reviewsTable, {
        relationName: "bookReviews"
    }),
    categories: many(bookCategoriesTable, {
        relationName: "bookCategories"
    }),
    orderItems: many(orderItemsTable, {
        relationName: "bookOrderItems"
    }),
    cartItems: many(cartItemsTable, {
        relationName: "bookCartItems"
    }),
    wishlistItems: many(wishlistItemsTable, {
        relationName: "bookWishlistItems"
    })
}));

export type BooksTable = InferSelectModel<typeof booksTable>;
export type CreateBookTable = InferInsertModel<typeof booksTable>;
export type UpdateBookTable = CreateBookTable;

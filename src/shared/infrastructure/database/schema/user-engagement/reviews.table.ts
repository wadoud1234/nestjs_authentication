import { pgTable, integer, text, unique, varchar, numeric } from "drizzle-orm/pg-core";
import { usersTable } from "../identity/users.table";
import { booksTable } from "../books/books.table";
import { InferInsertModel, InferSelectModel, relations } from "drizzle-orm";
import { id, timestamps } from "../_shared";

export const reviewsTable = pgTable("reviews", {
    id: id("id").primaryKey(),
    userId: id("user_id")
        .references(() => usersTable.id, { onDelete: "cascade" }),
    bookId: id("book_id")
        .references(() => booksTable.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 200 }).default("").notNull(),
    rating: integer("rating").notNull(), // e.g., 1-5
    comment: text("comment").notNull().default(""),
    ...timestamps,
}, (table) => [
    unique().on(table.userId, table.bookId)
]);

export const reviewRelations = relations(reviewsTable, ({ one }) => ({
    user: one(usersTable, {
        fields: [reviewsTable.userId],
        references: [usersTable.id],
        relationName: "userReviews"
    }),
    book: one(booksTable, {
        fields: [reviewsTable.bookId],
        references: [booksTable.id],
        relationName: "bookReviews"
    })
}));

export type Review = InferSelectModel<typeof reviewsTable>;
export type CreateReviewInput = InferInsertModel<typeof reviewsTable>;
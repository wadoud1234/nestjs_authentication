import { pgTable, integer, text } from "drizzle-orm/pg-core";
import { usersTable } from "./users.table";
import { booksTable } from "./books.table";
import { InferInsertModel, InferSelectModel, relations } from "drizzle-orm";
import { id, timestamps } from "./_shared";

export const reviewsTable = pgTable("reviews", {
    id: id("id").primaryKey(),
    userId: id("user_id")
        .references(() => usersTable.id, { onDelete: "cascade" }),
    bookId: id("book_id")
        .references(() => booksTable.id, { onDelete: "cascade" }),
    rating: integer("rating").notNull(), // e.g., 1-5
    comment: text("comment"),
    ...timestamps,
});

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
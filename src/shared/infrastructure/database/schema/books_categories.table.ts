import { pgTable, primaryKey } from "drizzle-orm/pg-core";
import { id } from "./_shared";
import { booksTable } from "./books.table";
import { categoriesTable } from "./categories.table";
import { relations } from "drizzle-orm";

export const bookCategoriesTable = pgTable(
    "book_categories",
    {
        bookId: id("book_id")
            .notNull()
            .references(() => booksTable.id, { onDelete: "cascade" }),
        categoryId: id("category_id")
            .notNull()
            .references(() => categoriesTable.id, { onDelete: "cascade" }),
    },
    (t) => ([
        primaryKey({ columns: [t.bookId, t.categoryId] }),
    ])
);

export const bookCategoryRelations = relations(bookCategoriesTable, ({ one }) => ({
    book: one(booksTable, {
        fields: [bookCategoriesTable.bookId],
        references: [booksTable.id],
        relationName: "bookCategories"
    }),
    category: one(categoriesTable, {
        fields: [bookCategoriesTable.categoryId],
        references: [categoriesTable.id],
        relationName: "categoryBooks"
    })
}));
import { pgTable, varchar } from "drizzle-orm/pg-core";
import { id, timestamps } from "./_shared";
import { InferInsertModel, InferSelectModel, relations } from "drizzle-orm";
import { bookCategoriesTable } from "./books_categories.table";

export const categoriesTable = pgTable("categories", {
    id: id("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull().unique(),
    description: varchar("description", { length: 500 }).notNull().default(""),
    ...timestamps
});

export const categoryRelations = relations(categoriesTable, ({ many }) => ({
    books: many(bookCategoriesTable, {
        relationName: "categoryBooks"
    })
}));

export type CategoriesTable = InferSelectModel<typeof categoriesTable>;
export type CreateCategoryInput = InferInsertModel<typeof categoriesTable>;
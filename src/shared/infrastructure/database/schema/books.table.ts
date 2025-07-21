import { index, integer, pgTable, real, text, uniqueIndex, varchar } from "drizzle-orm/pg-core";
import { id, timestamps } from "./_shared";
import { usersTable } from "./users.table";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";

export const booksTable = pgTable("books", {
    id: id("id").primaryKey(),
    title: varchar("title", { length: 255 }).notNull().unique(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    description: text("description"),
    pages: integer("pages").default(0).notNull(),
    stock: integer("stock").notNull(),
    authorId: id("author_id").references(() => usersTable.id).notNull(),
    rating: real("raitng").default(0).notNull(),
    isbn: varchar("isbn", { length: 100 }).notNull(),
    ...timestamps,
}, (table) => [
    uniqueIndex("slug_idx").on(table.slug),
    index("title_idx").on(table.title),
])

export type BooksTable = InferSelectModel<typeof booksTable>;
export type CreateBookTable = InferInsertModel<typeof booksTable>;
export type UpdateBookTable = CreateBookTable;

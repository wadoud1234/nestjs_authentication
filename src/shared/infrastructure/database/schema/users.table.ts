import { UserRole } from "@/modules/users/domain/enums/user-role.enum";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { pgTable, text, uuid, varchar, timestamp, pgEnum, uniqueIndex } from "drizzle-orm/pg-core";
import { id, timestamps } from "./_shared";

export const userRole = pgEnum("role", ["USER", "ADMIN"]);

export const usersTable = pgTable('users', {
    id: id("id").primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    password: varchar("password", { length: 255 }).notNull(),
    bio: text('bio').notNull().default(""),
    role: userRole().default(UserRole.USER).notNull().$type<UserRole>(),
    lastConnection: timestamp(),
    ...timestamps
}, (table) => [
    uniqueIndex("email_idx").on(table.email)
]);

export type UsersTable = InferSelectModel<typeof usersTable>;
export type CreateUserInput = InferInsertModel<typeof usersTable>
export type UpdateUserInput = CreateUserInput;
import { UserRole } from "@/modules/users/domain/enums/user-role.enum";
import { InferInsertModel, InferSelectModel, relations } from "drizzle-orm";
import { pgTable, text, uuid, varchar, timestamp, pgEnum, uniqueIndex } from "drizzle-orm/pg-core";
import { id, timestamps } from "./_shared";
import { refreshTokensTable } from "./refresh_tokens.table";
import { booksTable } from "./books.table";
import { reviewsTable } from "./reviews.table";
import { cartItemsTable } from "./cart-items.table";
import { wishlistItemsTable } from "./wishlist-items.table";
import { ordersTable } from "./orders.table";

export const userRole = pgEnum("role", ["USER", "ADMIN", "AUTHOR"]);

export const usersTable = pgTable('users', {
    id: id("id").primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    password: varchar("password", { length: 255 }).notNull(),
    bio: text('bio').notNull().default(""),
    role: userRole().default(UserRole.USER).notNull().$type<UserRole>(),
    lastConnection: timestamp("last_connection"),
    ...timestamps
}, (table) => [
    uniqueIndex("email_idx").on(table.email)
]);

export const userRelations = relations(usersTable, ({ many }) => ({
    refreshTokens: many(refreshTokensTable, {
        relationName: "userRefreshTokens"
    }),
    writtenBooks: many(booksTable, {
        relationName: "bookAuthor"
    }),
    reviews: many(reviewsTable, {
        relationName: "userReviews"
    }),
    cartItems: many(cartItemsTable, {
        relationName: "userCartItems"
    }),
    wishlistItems: many(wishlistItemsTable, {
        relationName: "userWishlistItems"
    }),
    orders: many(ordersTable, {
        relationName: "userOrders"
    })
}));

export type UsersTable = InferSelectModel<typeof usersTable>;
export type CreateUserInput = InferInsertModel<typeof usersTable>
export type UpdateUserInput = CreateUserInput;
import { InferInsertModel, InferSelectModel, relations } from "drizzle-orm";
import { pgTable, text, uuid, varchar, timestamp } from "drizzle-orm/pg-core";
import { id, timestamps } from "../_shared";
import { refreshTokensTable } from "./refresh_tokens.table";
import { booksTable } from "../books/books.table";
import { reviewsTable } from "../user-engagement/reviews.table";
import { wishlistItemsTable } from "../user-engagement/wishlist-items.table";
import { ordersTable } from "../commerce/orders.table";
import { addressesTable } from "../commerce/addresses.table";
import { cartsTable } from "../commerce/carts.table";
import { userRolesTable } from "./user-roles.table";

export const usersTable = pgTable('users', {
    id: id("id").primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    password: varchar("password", { length: 255 }).notNull(),
    bio: text('bio').notNull().default(""),
    lastConnection: timestamp("last_connection"),
    ...timestamps
});

export const userRelations = relations(usersTable, ({ many, one }) => ({
    refreshTokens: many(refreshTokensTable, {
        relationName: "userRefreshTokens"
    }),
    writtenBooks: many(booksTable, {
        relationName: "bookAuthor"
    }),
    reviews: many(reviewsTable, {
        relationName: "userReviews"
    }),
    cart: one(cartsTable),
    wishlistItems: many(wishlistItemsTable, {
        relationName: "userWishlistItems"
    }),
    orders: many(ordersTable, {
        relationName: "userOrders"
    }),
    addresses: many(addressesTable, {
        relationName: "userAddresses"
    }),
    roles: many(userRolesTable, {
        relationName: "userRoles"
    }), // ← connects user to role assignments

}));

export type UsersTable = InferSelectModel<typeof usersTable>;
export type CreateUserInput = InferInsertModel<typeof usersTable>
export type UpdateUserInput = CreateUserInput;
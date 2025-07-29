import { relations } from "drizzle-orm";
import { integer, pgTable, text } from "drizzle-orm/pg-core";
import { rolePermissionsTable } from "./role-permissions.table";
import { id } from "../_shared";

export const permissionsTable = pgTable('permissions', {
    id: id('id').primaryKey(),
    name: text('name').notNull().unique(), // e.g., "book:delete:any"
    description: text('description'),
});

export const permissionsRelations = relations(permissionsTable, ({ many }) => ({
    rolePermissions: many(rolePermissionsTable),
}));

export enum PermissionsEnum {
    // BOOKS
    BOOK_CREATE = 'book:create',

    BOOK_EDIT_OWN = 'book:edit:own',
    BOOK_EDIT_ANY = 'book:edit:any',

    BOOK_DELETE_OWN = 'book:delete:own',
    BOOK_DELETE_ANY = 'book:delete:any',

    BOOK_PUBLISH = 'book:publish',

    BOOK_VIEW_OWN_DRAFT = 'book:view:own-draft',
    BOOK_VIEW_ANY_DRAFY = 'book:view:any-draft',

    // USERS
    USER_READ_ANY = 'user:read:any',
    USER_BAN = 'user:ban',

    // SESSIONS

    // CATEGORIES
    CATEGORY_CREATE = "category:create",
    CATEGORY_EDIT = "category:edit",
    CATEGORY_DELETE = "category:delete",

    // REVIEWS
    REVIEW_CREATE = "review:create",

    REVIEW_UPDATE_OWN = "review:update:own",
    REVIEW_UPDATE_ANY = "reviw:update:any",

    REVIEW_DELETE_OWN = "review:delete:own",
    REVIEW_DELETE_ANY = "review:delete:any",

    // WISHLISTS
    WISHLIST_ITEM_CREATE = "wishlist_item:create",
    WISHLIST_ITEM_DELETE_OWN = "wishlist_item:delete:own",
    WISHLIST_ITEM_DELETE_ANY = "wishlist_item:delete:any",

    // CARTS
    CART_ITEM_ADD = "cart_item:add",
    CART_ITEM_REMOVE = "cart_item:remove",

    CART_ITEM_UPDATE_QUANTITY = "cart_item:update_quantity",

    CART_VIEW_OWN = "cart:view:own",
    CART_VIEW_ANY = "cart:view:any",

    CART_CLEAR_OWN = "cart:clear:own",
    CART_CLEAR_ANY = "cart:clear:any"

    // ORDERS


}
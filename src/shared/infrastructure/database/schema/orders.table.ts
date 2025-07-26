import { pgEnum, pgTable, text, timestamp, real, varchar } from "drizzle-orm/pg-core";
import { usersTable } from "./users.table";
import { id } from "./_shared";
import { relations } from "drizzle-orm";
import { orderItemsTable } from "./order-items.table";

export const orderStatusEnum = pgEnum("order_status", [
    "PENDING",
    "PAID",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED"
]);

export const ordersTable = pgTable("orders", {
    id: id("id").primaryKey(),
    userId: id("user_id")
        .notNull()
        .references(() => usersTable.id),
    status: orderStatusEnum().default("PENDING").notNull(),
    totalAmount: real("total_amount").notNull(),
    shippingAddress: text("shipping_address").notNull(),
    paymentMethod: varchar("payment_method", { length: 100 }),
    orderedAt: timestamp("ordered_at").defaultNow().notNull(),
});

export const orderRelations = relations(ordersTable, ({ one, many }) => ({
    user: one(usersTable, {
        fields: [ordersTable.userId],
        references: [usersTable.id],
        relationName: "userOrders"
    }),
    items: many(orderItemsTable, {
        relationName: "orderItems"
    })
}));
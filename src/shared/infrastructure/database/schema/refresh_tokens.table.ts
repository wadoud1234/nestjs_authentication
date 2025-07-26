import { boolean, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { id, timestamps } from "./_shared";
import { InferInsertModel, InferSelectModel, relations } from "drizzle-orm";
import { usersTable } from "./users.table";

export const refreshTokensTable = pgTable("refresh_tokens", {
    id: id("id").primaryKey(),
    token: varchar("token", { length: 400 }).notNull(),
    userId: id("user_id") // Foreign key column
        .notNull()
        .references(() => usersTable.id, { onDelete: 'cascade' }), // Link to usersTable.id
    isRevoked: boolean("is_revoked").default(false).notNull(), // To invalidate tokens
    expiresAt: timestamp("expires_at", { mode: 'date' }).notNull(),
    // You might also want to store client/device info for better management
    deviceId: varchar("device_id", { length: 255 }), // Optional: a unique ID for the device
    userAgent: text("user_agent"), // Optional: user agent string
    ipAddress: varchar("ip_address", { length: 45 }), // Optional: IP address
    ...timestamps
})

export const refreshTokenRelations = relations(refreshTokensTable, ({ one }) => ({
    user: one(usersTable, {
        fields: [refreshTokensTable.userId],
        references: [usersTable.id],
        relationName: "userRefreshTokens"
    })
}));

export type RefreshTokenTable = InferSelectModel<typeof refreshTokensTable>;
export type CreateRefreshTokenInput = InferInsertModel<typeof refreshTokensTable>;
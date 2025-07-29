import { pgTable, integer, primaryKey, index } from "drizzle-orm/pg-core";
import { usersTable } from "./users.table";
import { rolesTable } from "./roles.table";
import { relations } from "drizzle-orm";
import { id } from "../_shared";

// Junction: User → Roles
export const userRolesTable = pgTable('user_roles', {
    userId: id('user_id')
        .notNull()
        .references(() => usersTable.id, { onDelete: 'cascade' }),
    roleId: id('role_id')
        .notNull()
        .references(() => rolesTable.id, { onDelete: 'cascade' }),
},
    (table) => ([
        primaryKey({ columns: [table.userId, table.roleId] }), // ← Composite PK
        index('user_roles_role_id_idx').on(table.roleId)
    ])
);

export const userRolesRelations = relations(userRolesTable, ({ one }) => ({
    user: one(usersTable, {
        fields: [userRolesTable.userId],
        references: [usersTable.id],
        relationName: "userRoles"
    }),
    role: one(rolesTable, {
        fields: [userRolesTable.roleId],
        references: [rolesTable.id],
    }),
}));

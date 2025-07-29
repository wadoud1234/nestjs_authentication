import { relations } from "drizzle-orm";
import { permissionsTable } from "./permissions.table";
import { rolesTable } from "./roles.table";
import { pgTable, integer, primaryKey, index } from "drizzle-orm/pg-core";
import { id } from "../_shared";

export const rolePermissionsTable = pgTable('role_permissions', {
    roleId: id('role_id')
        .notNull()
        .references(() => rolesTable.id, { onDelete: 'cascade' }),
    permissionId: id('permission_id')
        .notNull()
        .references(() => permissionsTable.id, { onDelete: 'cascade' }),
},
    (table) => ([
        primaryKey({ columns: [table.roleId, table.permissionId] }), // ← Composite PK
        index('role_permissions_permission_id_idx').on(table.permissionId),
    ])
);

export const rolePermissionsRelations = relations(rolePermissionsTable, ({ one }) => ({
    role: one(rolesTable, {
        fields: [rolePermissionsTable.roleId],
        references: [rolesTable.id],
    }),
    permission: one(permissionsTable, {
        fields: [rolePermissionsTable.permissionId],
        references: [permissionsTable.id],
    }),
}));
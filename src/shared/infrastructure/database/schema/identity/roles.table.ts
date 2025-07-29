import { InferSelectModel, relations } from "drizzle-orm";
import { pgEnum, pgTable, text, varchar } from "drizzle-orm/pg-core";
import { rolePermissionsTable } from "./role-permissions.table";
import { userRolesTable } from "./user-roles.table";
import { id } from "../_shared";
import { UserRole } from "@/modules/users/domain/enums/user-role.enum";

export const userRoleNames = pgEnum("role", ["USER", "ADMIN", "AUTHOR"]);

// Roles: e.g., "ADMIN", "AUTHOR"
export const rolesTable = pgTable('roles', {
    id: id('id').primaryKey(),
    name: userRoleNames().notNull().unique().default(UserRole.USER).$type<UserRole>(), // "ADMIN"
    description: text('description'),
});

export const rolesRelations = relations(rolesTable, ({ many }) => ({
    rolePermissions: many(rolePermissionsTable),
    userRoles: many(userRolesTable),
}));

export type RolesTable = InferSelectModel<typeof rolesTable>
export type CreateRoleInput = InferSelectModel<typeof rolesTable>
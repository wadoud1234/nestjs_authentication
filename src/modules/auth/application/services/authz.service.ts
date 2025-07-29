// src/authorization/application/services/authorization.service.ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

import { and, eq, inArray } from 'drizzle-orm';
import { Database, InjectDatabase } from '@/shared/infrastructure/database/database.module';
import { permissionsTable, rolePermissionsTable, rolesTable, userRolesTable, usersTable } from '@/shared/infrastructure/database/schema/identity';
import { UserRole } from '@/modules/users/domain/enums/user-role.enum';

@Injectable()
export class AuthorizationService implements OnModuleInit {
    private readonly defaultPermissions = [
        'book:create',
        'book:edit:own',
        'book:edit:any',
        'book:delete:own',
        'book:delete:any',
        'book:publish',
        'book:view:own-draft',   // Author can view own draft
        'book:view:any-draft',   // Admin can view any draft
        'user:read:any',
        'user:ban',
    ];

    private readonly rolePermissionsMap = {
        USER: [],
        AUTHOR: [
            'book:create',
            'book:edit:own',
            'book:delete:own',
            'book:publish',
            'book:view:own-draft',
        ],
        ADMIN: [
            'book:create',
            'book:edit:own',
            'book:edit:any',
            'book:delete:own',
            'book:delete:any',
            'book:publish',
            'book:view:own-draft',
            'book:view:any-draft',
            'user:read:any',
            'user:ban',
        ],
    };

    constructor(
        @InjectDatabase() private readonly database: Database,
    ) { }

    private logger = new Logger(AuthorizationService.name)
    async onModuleInit() {
        await this.seedPermissions();
        await this.seedRoles();
        await this.assignPermissionsToRoles();
    }

    /**
     * Load full user with roles and permissions
     */
    async getUserWithRolesAndPermissions(userId: string) {
        const result = await this.database
            .select({
                id: usersTable.id,
                email: usersTable.email,
                name: usersTable.name,
                roles: rolesTable.name,
                permissions: permissionsTable.name,
            })
            .from(usersTable)
            .leftJoin(userRolesTable, eq(usersTable.id, userRolesTable.userId))
            .leftJoin(rolesTable, eq(userRolesTable.roleId, rolesTable.id))
            .leftJoin(rolePermissionsTable, eq(rolesTable.id, rolePermissionsTable.roleId))
            .leftJoin(permissionsTable, eq(rolePermissionsTable.permissionId, permissionsTable.id))
            .where(eq(usersTable.id, userId));

        if (result.length === 0) return null;

        const user = result[0];
        const roles = result.map(r => r.roles).filter(Boolean);
        const permissions = [...new Set(result.map(r => r.permissions).filter(Boolean))];

        return {
            id: user.id,
            email: user.email,
            name: user.name,
            roles,
            permissions,
        };
    }

    /**
     * Seed all base permissions
     */
    private async seedPermissions() {
        for (const name of this.defaultPermissions) {
            const existing = await this.database.query.permissionsTable.findFirst({
                where: eq(permissionsTable.name, name),
            });

            if (!existing) {
                await this.database.insert(permissionsTable).values({ name });
            }
        }
    }

    /**
     * Seed all base roles
     */
    private async seedRoles() {
        const roleNames = Object.keys(this.rolePermissionsMap) as Array<UserRole>;

        for (const name of roleNames) {
            const existing = await this.database.query.rolesTable.findFirst({
                where: eq(rolesTable.name, name),
            });

            if (!existing) {
                await this.database.insert(rolesTable).values({ name });
            }
        }
    }

    /**
     * Assign permissions to roles based on rolePermissionsMap
     */
    private async assignPermissionsToRoles() {
        const roles = await this.database.query.rolesTable.findMany();
        const permissions = await this.database.query.permissionsTable.findMany();

        const roleMap = new Map(roles.map(r => [r.name, r.id]));
        const permMap = new Map(permissions.map(p => [p.name, p.id]));

        const values: { roleId: string; permissionId: string }[] = [];

        for (const [roleName, permNames] of Object.entries(this.rolePermissionsMap)) {
            const roleId = roleMap.get(roleName as UserRole);
            if (!roleId) continue;

            for (const permName of permNames) {
                const permissionId = permMap.get(permName);
                if (!permissionId) continue;

                values.push({ roleId, permissionId });
            }
        }

        if (values.length > 0) {
            await this.database
                .insert(rolePermissionsTable)
                .values(values)
                .onConflictDoNothing();

        }
    }

    /**
     * Check if user has a specific permission
     */
    hasPermission(user: { permissions: string[] }, permission: string): boolean {
        return user.permissions.includes(permission);
    }

    /**
     * Get all permissions for a user (e.g., for debugging or UI)
     */
    getUserPermissions(user: { permissions: string[] }) {
        return user.permissions;
    }

    /**
     * Get all roles for a user
     */
    getUserRoles(user: { roles: string[] }) {
        return user.roles;
    }
}
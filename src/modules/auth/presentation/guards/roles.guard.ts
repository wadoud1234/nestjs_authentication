import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '@/modules/users/domain/enums/user-role.enum'; // Assuming your enum path
import { AuthenticatedRequest } from '@/modules/auth/presentation/types/authenticated-request.types'; // Your custom request type

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        // Get the required roles from the route handler metadata
        const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        // If no roles are specified, allow access (or disallow, depending on your default policy)
        if (!requiredRoles) {
            return true; // Or return false if you want routes without @Roles to be inaccessible
        }

        // Get the user from the request (SessionGuard should have already attached it)
        const request = context.switchToHttp().getRequest<AuthenticatedRequest<any>>();
        const user = request.user; // This comes from SessionGuard

        // If there's no user, or the user doesn't have a role, deny access
        if (!user || !user.role) {
            return false;
        }

        // Check if the user's role is among the required roles
        // For simple role checks, this is enough.
        // For hierarchical roles (e.g., Admin > User), you'd need more complex logic here.
        return requiredRoles.includes(user.role);
    }
}
import { AuthenticatedRequest } from "@/modules/auth/presentation/types/authenticated-request.types";
import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { YouDontHaveSufficientPermissionsExcpetion } from "../../domain/exceptions/insufficient-permissions.exception"

@Injectable()
export class PermissionGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const req = context.switchToHttp().getRequest<AuthenticatedRequest>();

        // 🔓 Skip if marked @Public()
        const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) return true;

        // 🔐 If not public, must be authenticated and have permissions
        const user = req.user;
        if (!user) {
            throw new ForbiddenException('Authentication required');
        }

        // Get required permissions
        const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
            'permissions',
            [context.getHandler(), context.getClass()],
        );

        // No permission required → allow
        if (!requiredPermissions || requiredPermissions.length === 0) return true;

        // Check if user has **any** of the required permissions (OR logic)
        // Or use `.every()` for AND logic
        const hasPermission = requiredPermissions.some((perm) =>
            user.permissions.includes(perm),
        );

        if (!hasPermission) {
            throw new YouDontHaveSufficientPermissionsExcpetion()
        }

        return true;
    }
}
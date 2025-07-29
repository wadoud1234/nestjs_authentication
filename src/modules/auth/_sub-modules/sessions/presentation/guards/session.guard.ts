import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { IS_PUBLIC_KEY } from "../../../../presentation/decorators/is-public.decorator";
import { AuthenticatedRequest } from "../../../../presentation/types/authenticated-request.types";
import { UserResponsePayload } from "@/modules/users/presentation/contracts/responses/user.response";
import { UserAuthPayload } from "@/modules/users/presentation/contracts/responses/user-auth.payload";

@Injectable()
export class SessionGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
        const session = request.session;

        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        // Attempt to load user from session regardless of 'public' status
        if (session && session.user && session.user.id && session.user.email) {
            request.user = session.user
        } else {
            // Explicitly set request.user to null if no valid session/user data
            // Ensure AuthenticatedRequest type allows 'user: UserResponsePayload | null | undefined;'
            // request.user = null;
        }

        // If the route is public, always allow access
        if (isPublic) {
            return true;
        }

        // If the route is NOT public, then enforce authentication (i.e., user must exist)
        if (!request.user) { // Check if user was successfully populated from session
            throw new UnauthorizedException();
        }

        return true
    }
}
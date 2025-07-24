import { Injectable, NestMiddleware } from "@nestjs/common";
import { InjectSessionManager, SessionManagerService } from "../../application/services/session-manager.session";
import { AuthenticatedRequest } from "@/modules/auth/presentation/types/authenticated-request.types";

// Middleware to update session activity
@Injectable()
export class SessionActivityMiddleware implements NestMiddleware {
    constructor(@InjectSessionManager() private readonly sessionManager: SessionManagerService) { }

    async use(req: AuthenticatedRequest, res: any, next: () => void) {
        if (req.session && req.session.sessionId) {
            // Update last activity for authenticated sessions
            const userSession = req.session.get('user');
            if (userSession) {
                await this.sessionManager.updateSessionActivity(req.session.sessionId);
            }
        }
        next();
    }
}
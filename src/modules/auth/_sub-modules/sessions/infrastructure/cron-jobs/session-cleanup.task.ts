import { Injectable, Logger } from "@nestjs/common";
import { InjectSessionManager, SessionManagerService } from "../../application/services/session-manager.session";
import { Cron, CronExpression } from "@nestjs/schedule";

export interface SessionCleanupTask {

}

@Injectable()
export class SessionCleanupTaskImpl implements SessionCleanupTask {
    private readonly logger = new Logger(SessionCleanupTaskImpl.name);

    constructor(
        @InjectSessionManager() private readonly sessionManager: SessionManagerService
    ) { }

    /**
       * Clean up expired sessions every 30 minutes
       */
    @Cron(CronExpression.EVERY_30_MINUTES)
    async handleSessionCleanup() {
        this.logger.log('Starting scheduled session cleanup...');

        try {
            const cleanedSessions = await this.sessionManager.cleanupExpiredSessions();
            this.logger.log(`Cleaned up ${cleanedSessions} expired sessions`);
        } catch (error) {
            this.logger.error('Error during session cleanup:', error);
        }
    }

    /**
   * Log session statistics every hour
   */
    @Cron(CronExpression.EVERY_HOUR)
    async logSessionStats() {
        try {
            const [allSessions, activeUsersCount] = await Promise.all([
                this.sessionManager.getAllActiveSessions(),
                this.sessionManager.getActiveUsersCount()
            ]);

            this.logger.log(`Session Stats - Total: ${allSessions.length}, Active Users: ${activeUsersCount}`);
        } catch (error) {
            this.logger.error('Error logging session stats:', error);
        }
    }


}
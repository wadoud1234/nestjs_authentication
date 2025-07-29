import { Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Query, UseGuards } from "@nestjs/common";
import { SessionGuard } from "./guards/session.guard";
import { InjectSessionManager, SessionManagerService } from "../application/services/session-manager.session";
import { ActiveSession } from "../domain/types/active-session.types";
import { RolesGuard } from "@/modules/auth/presentation/guards/roles.guard";
import { Roles } from "@/modules/auth/presentation/decorators/roles.decorator";
import { UserRole } from "@/modules/users/domain/enums/user-role.enum";

@Controller("auth/sessions")
@UseGuards(SessionGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class SessionsController {
    constructor(
        @InjectSessionManager() private readonly sessionManager: SessionManagerService
    ) { }

    /**
   * Get all active sessions with pagination
   */
    @Get()
    async getActiveSessions(
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '10'
    ) {
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 10;

        const result = await this.sessionManager.getActiveSessionsPaginated(pageNum, limitNum);

        return {
            data: result,
            message: 'Active sessions retrieved successfully'
        };
    }

    /**
   * Get active sessions count and stats
    */
    @Get('stats')
    async getSessionStats() {
        const [totalSessions, activeUsersCount] = await Promise.all([
            this.sessionManager.getAllActiveSessions(),
            this.sessionManager.getActiveUsersCount()
        ]);

        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        const recentSessions = totalSessions.filter(s =>
            new Date(s.lastActivity) > oneHourAgo
        ).length;

        const todaySessions = totalSessions.filter(s =>
            new Date(s.loginTime) > oneDayAgo
        ).length;

        return {
            data: {
                totalActiveSessions: totalSessions.length,
                activeUsers: activeUsersCount,
                recentActivity: recentSessions, // Active in last hour
                todayLogins: todaySessions,
                sessionsPerUser: totalSessions.length > 0 ?
                    (totalSessions.length / activeUsersCount).toFixed(2) : 0
            },
            message: 'Session statistics retrieved successfully'
        };
    }

    /**
   * Get sessions for a specific user
   */
    @Get('user/:userId')
    async getUserSessions(@Param('userId') userId: string) {
        const sessions = await this.sessionManager.getUserActiveSessions(userId);

        return {
            data: {
                userId,
                sessions,
                sessionCount: sessions.length
            },
            message: `Sessions for user ${userId} retrieved successfully`
        };
    }

    /**
   * Get currently active users (unique users with active sessions)
   */
    @Get('active-users')
    async getActiveUsers() {
        const sessions = await this.sessionManager.getAllActiveSessions();

        // Group sessions by user
        const userSessions = sessions.reduce((acc, session) => {
            if (session.userId) {
                if (!acc[session.userId]) {
                    acc[session.userId] = {
                        userId: session.userId,
                        username: session.username,
                        roles: session.roles,
                        permissions: session.permissions,
                        sessionCount: 0,
                        lastActivity: session.lastActivity,
                        firstLogin: session.loginTime,
                        sessions: []
                    };
                }

                acc[session.userId].sessionCount++;
                acc[session.userId].sessions.push({
                    sessionId: session.sessionId,
                    lastActivity: session.lastActivity,
                    loginTime: session.loginTime,
                    ipAddress: session.ipAddress,
                    userAgent: session.userAgent
                });

                // Update last activity if this session is more recent
                if (new Date(session.lastActivity) > new Date(acc[session.userId].lastActivity)) {
                    acc[session.userId].lastActivity = session.lastActivity;
                }

                // Update first login if this session is older
                if (new Date(session.loginTime) < new Date(acc[session.userId].firstLogin)) {
                    acc[session.userId].firstLogin = session.loginTime;
                }
            }

            return acc;
        }, {} as Record<string, any>);

        const users = Object.values(userSessions)
            .sort((a: any, b: any) =>
                new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
            );

        return {
            success: true,
            data: {
                users,
                totalActiveUsers: users.length
            },
            message: 'Active users retrieved successfully'
        };
    }

    /**
       * Force logout a user from all devices
       */
    @Delete('user/:userId')
    @HttpCode(HttpStatus.OK)
    async forceLogoutUser(@Param('userId') userId: string) {
        const loggedOutSessions = await this.sessionManager.forceLogoutUser(userId);

        return {
            success: true,
            data: {
                userId,
                loggedOutSessions
            },
            message: `User ${userId} logged out from ${loggedOutSessions} sessions`
        };
    }

    /**
       * Force logout a specific session
       */
    @Delete('session/:sessionId')
    @HttpCode(HttpStatus.OK)
    async forceLogoutSession(@Param('sessionId') sessionId: string) {
        const success = await this.sessionManager.forceLogoutSession(sessionId);

        return {
            success,
            data: { sessionId },
            message: success ?
                `Session ${sessionId} logged out successfully` :
                `Failed to logout session ${sessionId}`
        };
    }

    /**
   * Clean up expired sessions
   */
    @Post('cleanup')
    @HttpCode(HttpStatus.OK)
    async cleanupExpiredSessions() {
        const cleanedCount = await this.sessionManager.cleanupExpiredSessions();

        return {
            data: { cleanedSessions: cleanedCount },
            message: `Cleaned up ${cleanedCount} expired sessions`
        };
    }

    /**
       * Get sessions by activity (recent, idle, etc.)
       */
    @Get('by-activity')
    async getSessionsByActivity(
        @Query('type') type: 'recent' | 'idle' | 'all' = 'all',
        @Query('minutes') minutes: string = '30'
    ) {
        const sessions = await this.sessionManager.getAllActiveSessions();
        const minutesAgo = new Date(Date.now() - parseInt(minutes) * 60 * 1000);

        let filteredSessions: ActiveSession[];

        switch (type) {
            case 'recent':
                filteredSessions = sessions.filter(s =>
                    new Date(s.lastActivity) > minutesAgo
                );
                break;
            case 'idle':
                filteredSessions = sessions.filter(s =>
                    new Date(s.lastActivity) <= minutesAgo
                );
                break;
            default:
                filteredSessions = sessions;
        }

        return {
            success: true,
            data: {
                sessions: filteredSessions,
                type,
                filterMinutes: minutes,
                totalFiltered: filteredSessions.length,
                totalSessions: sessions.length
            },
            message: `Sessions filtered by ${type} activity retrieved successfully`
        };
    }
}
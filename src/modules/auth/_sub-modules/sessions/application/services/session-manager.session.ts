import { InjectRedis } from "@/shared/infrastructure/redis/providers/redis.service";
import { Inject, Injectable, Logger, Provider } from "@nestjs/common";
import Redis from "ioredis";
import { ActiveSession } from "../../domain/types/active-session.types";
import { UserRole } from "@/modules/users/domain/enums/user-role.enum";

interface UserInfo {
    userId: string;
    username: string;
    role: UserRole;
    ipAddress?: string;
    userAgent?: string;
}

export interface SessionManagerService {
    trackActiveSession(sessionId: string, userInfo: UserInfo): Promise<void>,
    updateSessionActivity(sessionId: string): Promise<void>,
    removeActiveSession(sessionId: string): Promise<void>,
    getAllActiveSessions(): Promise<ActiveSession[]>,
    getUserActiveSessions(userId: string): Promise<ActiveSession[]>,
    getActiveUsersCount(): Promise<number>,
    getActiveSessionsPaginated(page: number, limit: number): Promise<{
        sessions: ActiveSession[];
        total: number;
        page: number;
        totalPages: number;
    }>,
    forceLogoutUser(userId: string): Promise<number>,
    forceLogoutSession(sessionId: string): Promise<boolean>,
    cleanupExpiredSessions(): Promise<number>,
}

@Injectable()
export class SessionManagerServiceImpl implements SessionManagerService {
    private readonly logger = new Logger(SessionManagerServiceImpl.name);
    private readonly sessionPrefix = 'sess:';
    private readonly activeSessionsKey = 'active_sessions';
    private readonly userSessionsPrefix = 'user_sessions:';

    constructor(
        @InjectRedis() private readonly redisClient: Redis
    ) { }

    /**
       * Track a new active session when user logs in
       */
    async trackActiveSession(sessionId: string, userInfo: UserInfo): Promise<void> {
        try {
            const sessionInfo: ActiveSession = {
                sessionId,
                userId: userInfo.userId,
                username: userInfo.username,
                role: userInfo.role,
                lastActivity: new Date(),
                ipAddress: userInfo.ipAddress,
                userAgent: userInfo.userAgent,
                loginTime: new Date(),
            };

            // Store in active sessions set
            await this.redisClient.hset(
                this.activeSessionsKey,
                sessionId,
                JSON.stringify(sessionInfo)
            );

            // Track user's sessions (for multi-device login tracking)
            await this.redisClient.sadd(
                `${this.userSessionsPrefix}${userInfo.userId}`,
                sessionId
            );

            // Set expiration (same as session TTL)
            await this.redisClient.expire(`${this.userSessionsPrefix}${userInfo.userId}`, 86400);

            this.logger.log(`Tracking active session for user ${userInfo.userId}`);
        } catch (error) {
            this.logger.error('Error tracking active session:', error);
        }
    }

    /**
   * Update last activity for a session
   */
    async updateSessionActivity(sessionId: string): Promise<void> {
        try {
            const sessionData = await this.redisClient.hget(this.activeSessionsKey, sessionId);
            if (sessionData) {
                const session: ActiveSession = JSON.parse(sessionData);
                session.lastActivity = new Date();

                await this.redisClient.hset(
                    this.activeSessionsKey,
                    sessionId,
                    JSON.stringify(session)
                );
            }
        } catch (error) {
            this.logger.error('Error updating session activity:', error);
        }
    }

    /**
   * Remove session when user logs out or session expires
   */
    async removeActiveSession(sessionId: string): Promise<void> {
        try {
            // Get session info first
            const sessionData = await this.redisClient.hget(this.activeSessionsKey, sessionId);

            if (sessionData) {
                const session: ActiveSession = JSON.parse(sessionData);

                // Remove from active sessions
                await this.redisClient.hdel(this.activeSessionsKey, sessionId);

                // Remove from user's sessions set
                if (session.userId) {
                    await this.redisClient.srem(
                        `${this.userSessionsPrefix}${session.userId}`,
                        sessionId
                    );
                }

                this.logger.log(`Removed active session ${sessionId}`);
            }
        } catch (error) {
            this.logger.error('Error removing active session:', error);
        }
    }

    /**
     * Get all active sessions
     */
    async getAllActiveSessions(): Promise<ActiveSession[]> {
        try {
            const sessions = await this.redisClient.hgetall(this.activeSessionsKey);

            return Object.values(sessions).map(sessionData => {
                try {
                    return JSON.parse(sessionData);
                } catch {
                    return null;
                }
            }).filter(Boolean);
        } catch (error) {
            this.logger.error('Error getting active sessions:', error);
            return [];
        }
    }

    /**
     * Get active sessions for a specific user
     */
    async getUserActiveSessions(userId: string): Promise<ActiveSession[]> {
        try {
            const sessionIds = await this.redisClient.smembers(`${this.userSessionsPrefix}${userId}`);

            if (sessionIds.length === 0) {
                return [];
            }

            const sessions = await this.redisClient.hmget(this.activeSessionsKey, ...sessionIds);

            return sessions
                .filter(Boolean)
                .map((sessionData: string) => {
                    try {
                        return JSON.parse(sessionData);
                    } catch {
                        return null;
                    }
                })
                .filter(Boolean);
        } catch (error) {
            this.logger.error('Error getting user active sessions:', error);
            return [];
        }
    }

    /**
     * Get count of active users
     */
    async getActiveUsersCount(): Promise<number> {
        try {
            const sessions = await this.getAllActiveSessions();
            const uniqueUsers = new Set(sessions.map(s => s.userId).filter(Boolean));
            return uniqueUsers.size;
        } catch (error) {
            this.logger.error('Error getting active users count:', error);
            return 0;
        }
    }

    /**
     * Get active sessions with pagination
     */
    async getActiveSessionsPaginated(page: number = 1, limit: number = 10): Promise<{
        sessions: ActiveSession[];
        total: number;
        page: number;
        totalPages: number;
    }> {
        try {
            const allSessions = await this.getAllActiveSessions();
            const total = allSessions.length;
            const totalPages = Math.ceil(total / limit);
            const offset = (page - 1) * limit;

            const sessions = allSessions
                .sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime())
                .slice(offset, offset + limit);

            return {
                sessions,
                total,
                page,
                totalPages,
            };
        } catch (error) {
            this.logger.error('Error getting paginated active sessions:', error);
            return { sessions: [], total: 0, page, totalPages: 0 };
        }
    }

    /**
     * Force logout a user from all devices
     */
    async forceLogoutUser(userId: string): Promise<number> {
        try {
            const sessionIds = await this.redisClient.smembers(`${this.userSessionsPrefix}${userId}`);

            if (sessionIds.length === 0) {
                return 0;
            }

            // Remove actual session data
            const pipeline = this.redisClient.pipeline();

            for (const sessionId of sessionIds) {
                // Remove from session store
                pipeline.del(`${this.sessionPrefix}${sessionId}`);
                // Remove from active sessions tracking
                pipeline.hdel(this.activeSessionsKey, sessionId);
            }

            // Remove user's session set
            pipeline.del(`${this.userSessionsPrefix}${userId}`);

            await pipeline.exec();

            this.logger.log(`Force logged out user ${userId} from ${sessionIds.length} sessions`);
            return sessionIds.length;
        } catch (error) {
            this.logger.error('Error force logging out user:', error);
            return 0;
        }
    }

    /**
     * Force logout a specific session
     */
    async forceLogoutSession(sessionId: string): Promise<boolean> {
        try {
            // Remove actual session data
            await this.redisClient.del(`${this.sessionPrefix}${sessionId}`);

            // Remove from tracking
            await this.removeActiveSession(sessionId);

            this.logger.log(`Force logged out session ${sessionId}`);
            return true;
        } catch (error) {
            this.logger.error('Error force logging out session:', error);
            return false;
        }
    }

    /**
     * Clean up expired sessions from tracking
     */
    async cleanupExpiredSessions(): Promise<number> {
        try {
            const sessions = await this.getAllActiveSessions();
            const expiredSessions: string[] = [];

            for (const session of sessions) {
                // Check if actual session still exists
                const exists = await this.redisClient.exists(`${this.sessionPrefix}${session.sessionId}`);
                if (!exists) {
                    expiredSessions.push(session.sessionId);
                }
            }

            // Remove expired sessions from tracking
            if (expiredSessions.length > 0) {
                const pipeline = this.redisClient.pipeline();

                for (const sessionId of expiredSessions) {
                    pipeline.hdel(this.activeSessionsKey, sessionId);
                }

                await pipeline.exec();

                this.logger.log(`Cleaned up ${expiredSessions.length} expired sessions`);
            }

            return expiredSessions.length;
        } catch (error) {
            this.logger.error('Error cleaning up expired sessions:', error);
            return 0;
        }
    }
}

export const SessionManagerServiceToken = Symbol("SessionManagerService")

export const InjectSessionManager = () => Inject(SessionManagerServiceToken);

export const SessionManagerServiceProvider: Provider = {
    provide: SessionManagerServiceToken,
    useClass: SessionManagerServiceImpl
}
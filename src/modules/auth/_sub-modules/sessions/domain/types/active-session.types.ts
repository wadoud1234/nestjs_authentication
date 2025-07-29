import { UserRole } from "@/modules/users/domain/enums/user-role.enum";

export interface ActiveSession {
    sessionId: string;
    userId: string;
    username: string;
    roles: UserRole[];
    permissions: string[];
    lastActivity: Date;
    ipAddress?: string;
    userAgent?: string;
    loginTime: Date;
}
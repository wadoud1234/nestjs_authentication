import { UserRole } from '@/modules/users/domain/enums/user-role.enum';
import 'fastify';

interface FastifySession {
    [key: string]: any;
    save(): Promise<void>;
    destroy(): Promise<void>;
    regenerate(): Promise<void>;
    reload(): Promise<void>;
}

declare module 'fastify' {
    interface FastifyRequest {
        session: FastifySession;
    }
    interface Session {
        user?: {
            id: string;
            name: string;
            email: string;
            roles: UserRole[];
            permissions: string[];
        };
    }
}

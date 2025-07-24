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
            role: string;
        };
    }
}

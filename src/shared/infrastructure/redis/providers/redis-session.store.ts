import { Injectable, Provider } from '@nestjs/common';
import Redis from 'ioredis';
import { InjectRedis, RedisService, RedisServiceToken } from './redis.service';

export interface RedisSessionStore {
    get(sessionId: string, callback: (error: any, session?: any) => void): Promise<void>
    set(sessionId: string, session: any, callback: (error?: any) => void): Promise<void>
    destroy(sessionId: string, callback: (error?: any) => void): Promise<void>
}

@Injectable()
export class RedisSessionStoreImpl implements RedisSessionStore {
    private readonly prefix: string
    private readonly ttl: number

    constructor(
        private readonly redisClient: Redis,
        options: { prefix?: string; ttl?: number } = {}
    ) {
        this.prefix = options.prefix || "session:";
        this.ttl = options.ttl || 86400; // 24 hours in seconds;
    }

    async get(sessionId: string, callback: (error: any, session?: any) => void) {
        try {
            const key = this.prefix + sessionId;
            const data = await this.redisClient.get(key);
            const session = data ? JSON.parse(data) : null;
            callback(null, session);
        } catch (error) {
            callback(error, null);
        }
    }

    async set(sessionId: string, session: any, callback: (error?: any) => void) {
        try {
            const key = this.prefix + sessionId;
            await this.redisClient.set(key, JSON.stringify(session), 'EX', this.ttl);
            callback();
        } catch (error) {
            callback(error);
        }
    }

    async destroy(sessionId: string, callback: (error?: any) => void) {
        try {
            const key = this.prefix + sessionId;
            await this.redisClient.del(key);
            callback();
        } catch (error) {
            callback(error);
        }
    }
}

export const RedisSessionStoreToken = Symbol("RedisSessionStore")

export const RedisSessionStoreProvider: Provider = {
    provide: RedisSessionStoreToken,
    inject: [RedisServiceToken],
    useFactory: (redisService: RedisService) => {
        return new RedisSessionStoreImpl(redisService, {
            prefix: 'session:',
            ttl: 86400
        });
    }
}
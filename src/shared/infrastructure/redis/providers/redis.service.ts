import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit, Provider, OnApplicationShutdown } from "@nestjs/common";
import Redis from "ioredis"
import { AppConfigService, InjectAppConfig } from "../../config/app-config.service";

export interface RedisService extends Redis { }

@Injectable()
export class RedisServiceImpl extends Redis implements RedisService, OnModuleDestroy, OnApplicationShutdown {
    private readonly logger = new Logger(RedisServiceImpl.name);

    constructor(
        @InjectAppConfig() appConfig: AppConfigService
    ) {
        super({
            port: appConfig.REDIS_PORT,
            host: appConfig.REDIS_HOST,
        })
    }

    // async onModuleInit() {
    //     this.logger.log('Connecting to Redis...');
    //     try {
    //         await this.connect();
    //         this.logger.log('Redis connected');
    //     } catch (error) {
    //         this.logger.error('Redis connection failed', error);
    //     }
    // }

    async onModuleDestroy() {
        await this.shutdown_client();
    }

    async onApplicationShutdown(signal: string) {
        this.logger.warn(`App shutting down with signal: ${signal}`);
        await this.shutdown_client();
    }

    private async shutdown_client() {
        try {
            this.logger.log('Closing Redis connection...');
            await this.quit(); // graceful shutdown
            this.logger.log('Redis connection closed');
        } catch (error) {
            this.logger.error('Error while closing Redis connection', error);
        }
    }
}

export const RedisServiceToken = Symbol("RedisServiceToken");

export const InjectRedis = () => Inject(RedisServiceToken)

export const RedisServiceProvider: Provider = {
    provide: RedisServiceToken,
    useClass: RedisServiceImpl
}
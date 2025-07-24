import { Global, Module } from "@nestjs/common";
import { RedisServiceProvider } from "./providers/redis.service";
import { RedisSessionStoreProvider } from "./providers/redis-session.store";

@Global()
@Module({
    providers: [RedisServiceProvider, RedisSessionStoreProvider],
    exports: [RedisServiceProvider, RedisSessionStoreProvider]
})
export class RedisModule { }
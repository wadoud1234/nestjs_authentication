import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs"
import { SuccessResponseInterceptor } from "../presentation/interceptors/success-response.interceptor";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { AppConfigModule } from "./config/config.module";
import { DatabaseModule } from "./database/database.module";
import { RedisModule } from "./redis/redis.module";
import { ScheduleModule } from "@nestjs/schedule";

@Module({
    imports: [
        CqrsModule.forRoot(),
        AppConfigModule,
        ScheduleModule.forRoot(),
        RedisModule,
        DatabaseModule
    ],
    providers: [
        {
            provide: APP_INTERCEPTOR,
            useClass: SuccessResponseInterceptor
        }
    ],
    exports: [CqrsModule, AppConfigModule, DatabaseModule, RedisModule, ScheduleModule],
})
export class InfrastructureModule { }
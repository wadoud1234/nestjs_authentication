import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs"
import { SuccessResponseInterceptor } from "../presentation/interceptors/success-response.interceptor";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { AppConfigModule } from "./config/config.module";
import { DatabaseModule } from "./database/database.module";

@Module({
    imports: [
        CqrsModule.forRoot(),
        AppConfigModule,
        DatabaseModule
    ],
    providers: [
        {
            provide: APP_INTERCEPTOR,
            useClass: SuccessResponseInterceptor
        }
    ],
    exports: [CqrsModule, AppConfigModule, DatabaseModule],
})
export class InfrastructureModule { }
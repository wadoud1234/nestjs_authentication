import { Global, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import validateEnv from "./validate-env";
import { AppConfigServiceProvider, AppConfigServiceToken } from "./app-config.service";

@Global()
@Module({
    imports: [
        ConfigModule.forRoot({
            validate: validateEnv
        })],
    providers: [
        AppConfigServiceProvider
    ],
    exports: [ConfigModule, AppConfigServiceProvider]
})
export class AppConfigModule { }
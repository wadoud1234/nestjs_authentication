import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import validateEnv from "./validate-env";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            validate: validateEnv
        })],
    exports: [ConfigModule]
})
export class AppConfigModule { }
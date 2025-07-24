import { Module } from "@nestjs/common";
import { AuthController } from "../presentation/controllers/auth.controller";
import { UsersModule } from "@/modules/users/infrastructure/users.module";
import { AuthCommandHandlers, AuthGuards, AuthQueryHandlers, AuthServices, AuthStrategies } from "./auth.module-providers";
import { PassportModule } from "@nestjs/passport";
import { AppConfigModule } from "@/shared/infrastructure/config/config.module";
import { JwtsModule } from "../_sub-modules/jwts/infrastructure/jwts.module";
import { SessionsModule } from "../_sub-modules/sessions/infrastructure/sessions.module";
// import { SessionSerializer } from "../presentation/serializers/session.serializer";

@Module({
    imports: [
        JwtsModule,
        SessionsModule,
        UsersModule,
        PassportModule,
        AppConfigModule
    ],
    controllers: [AuthController],
    providers: [
        // SessionSerializer,
        ...AuthGuards,
        ...AuthStrategies,
        ...AuthCommandHandlers,
        ...AuthQueryHandlers,
        ...AuthServices
    ],
    exports: [
        SessionsModule,
        JwtsModule,
        ...AuthGuards,
        ...AuthStrategies,
        ...AuthCommandHandlers,
        ...AuthQueryHandlers,
        ...AuthServices]
})
export class AuthModule { }
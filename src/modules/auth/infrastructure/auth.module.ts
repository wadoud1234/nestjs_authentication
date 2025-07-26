import { Module } from "@nestjs/common";
import { UsersModule } from "@/modules/users/infrastructure/users.module";
import { AuthCommandHandlers, AuthGuards, AuthQueryHandlers, AuthServices, AuthStrategies } from "./auth.module-providers";
import { PassportModule } from "@nestjs/passport";
import { AppConfigModule } from "@/shared/infrastructure/config/config.module";
import { JwtsModule } from "../_sub-modules/jwts/infrastructure/jwts.module";
import { SessionsModule } from "../_sub-modules/sessions/infrastructure/sessions.module";
import { AuthCommandsController } from "../presentation/controllers/auth.commands-controller";
import { AuthQueriesController } from "../presentation/controllers/auth.queries-controller";
// import { SessionSerializer } from "../presentation/serializers/session.serializer";

@Module({
    imports: [
        JwtsModule,
        SessionsModule,
        UsersModule,
        PassportModule,
        AppConfigModule
    ],
    controllers: [
        AuthCommandsController,
        AuthQueriesController
    ],
    providers: [
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
        ...AuthServices
    ]
})
export class AuthModule { }
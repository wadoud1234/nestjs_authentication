import { MiddlewareConsumer, Module } from "@nestjs/common";
import { AuthModule } from "src/modules/auth/infrastructure/auth.module";
import { UsersModule } from "src/modules/users/infrastructure/users.module";
import { InfrastructureModule } from "./shared/infrastructure/infrastructure.module";
import { APP_GUARD } from "@nestjs/core";
import { SessionGuard } from "./modules/auth/_sub-modules/sessions/presentation/guards/session.guard";
import { SessionActivityMiddleware } from "./modules/auth/_sub-modules/sessions/presentation/middlewares/session-activity.middleware";
import { RolesGuard } from "./modules/auth/presentation/guards/roles.guard";

@Module({
    imports: [InfrastructureModule, AuthModule, UsersModule],
    providers: [
        {
            provide: APP_GUARD,
            useClass: SessionGuard
        },
        {
            provide: APP_GUARD,
            useClass: RolesGuard
        }
    ]
})
export class AppModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(SessionActivityMiddleware)
            .forRoutes('/api'); // Apply to all routes
        // OR .forRoutes({ path: 'auth/*', method: RequestMethod.ALL }); // Apply to specific routes
    }
}
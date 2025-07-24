import { Provider } from "@nestjs/common";
import { SessionGuard } from "../presentation/guards/session.guard";
import { SessionManagerServiceProvider } from "../application/services/session-manager.session";
import { SessionActivityMiddleware } from "../presentation/middlewares/session-activity.middleware";

export const SessionsModuleServices: Provider[] = [
    SessionManagerServiceProvider
]

export const SessionsModuleStrategies: Provider[] = [

]

export const SessionsModuleGuards: Provider[] = [
    SessionGuard
]

export const SessionsModuleMiddlewares: Provider[] = [
    SessionActivityMiddleware
]
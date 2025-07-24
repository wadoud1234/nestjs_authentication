import { Provider } from "@nestjs/common";
import { AccessTokenServiceProvider } from "../application/services/access-token.service";
import { RefreshTokenServiceProvider } from "../application/services/refresh-token.service";
import { AccessTokenGuard } from "../presentation/guards/access-token.guard";
import { RefreshTokenGuard } from "../presentation/guards/refresh-token.guard";
import { AccessTokenStrategyProvider } from "../application/strategies/access-token.strategy";
import { RefreshTokenStrategyProvider } from "../application/strategies/refresh-token.strategy";

export const JwtsModuleServices: Provider[] = [
    AccessTokenServiceProvider,
    RefreshTokenServiceProvider
]

export const JwtsModuleGuards: Provider[] = [
    AccessTokenGuard,
    RefreshTokenGuard
]

export const JwtsModuleStrategies: Provider[] = [
    AccessTokenStrategyProvider,
    RefreshTokenStrategyProvider
]
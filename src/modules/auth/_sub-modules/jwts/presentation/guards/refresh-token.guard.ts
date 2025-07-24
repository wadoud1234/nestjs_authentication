import { AuthGuard } from "@nestjs/passport";
import { RefreshTokenStrategyName } from "../../application/strategies/refresh-token.strategy";
import { Injectable } from "@nestjs/common";

@Injectable()
export class RefreshTokenGuard extends AuthGuard(RefreshTokenStrategyName) { }
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { AccessTokenStrategyName } from "../../application/strategies/access-token.strategy";
import { Observable } from "rxjs";
import { IS_PUBLIC_KEY } from "../../../../presentation/decorators/is-public.decorator";
import { Reflector } from "@nestjs/core";

@Injectable()
export class AccessTokenGuard extends AuthGuard(AccessTokenStrategyName) implements CanActivate {
    constructor(private readonly reflector: Reflector) {
        super();
    }

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) {
            return true;
        }
        return super.canActivate(context);
    }

}
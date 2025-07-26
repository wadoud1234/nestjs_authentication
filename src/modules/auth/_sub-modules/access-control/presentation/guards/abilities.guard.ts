import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { AuthAbilityFactory } from "../../application/factories/auth-ability.factory";
import { CHECK_ABILITY, RequiredRule } from "../decorators/check-permission.decorator";
import { AuthenticatedRequest } from "@/modules/auth/presentation/types/authenticated-request.types";

@Injectable()
export class AbilitiesGuard<T> implements CanActivate {
    constructor(
        private reflector: Reflector,
        private caslAbilityFactory: AuthAbilityFactory,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const rules = this.reflector.get<RequiredRule[]>(
            CHECK_ABILITY,
            context.getHandler(),
        ) || [];

        if (rules.length === 0) {
            return true;
        }

        const request = context.switchToHttp().getRequest<AuthenticatedRequest<T>>();
        const user = request.user; // Assuming user is attached by your session guard

        if (!user) {
            throw new ForbiddenException('User not authenticated');
        }

        const ability = this.caslAbilityFactory.createForUser(user);

        // Check if user has all required abilities
        const hasPermission = rules.every((rule) =>
            ability.can(rule.action, rule.subject),
        );

        if (!hasPermission) {
            throw new ForbiddenException('Insufficient permissions');
        }

        return true;
    }
}
import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthAbilityFactory } from "../../application/factories/auth-ability.factory";
import { Action, Subjects } from "../../domain/types";
import { CHECK_ABILITY, RequiredRule } from "../decorators/check-permission.decorator";
import { AuthenticatedRequest } from "@/modules/auth/presentation/types/authenticated-request.types";
import { BookEntity } from "@/modules/books/domain/entities/book.entity";

// @Injectable()
// export class AbilitiesResourceGuard implements CanActivate {
//     constructor(
//         private reflector: Reflector,
//         private caslAbilityFactory: AuthAbilityFactory,
//     ) { }

//     async canActivate(context: ExecutionContext): Promise<boolean> {
//         const request = context.switchToHttp().getRequest();
//         const user = request.user;

//         if (!user) {
//             throw new ForbiddenException('User not authenticated');
//         }

//         const ability = this.caslAbilityFactory.createForUser(user);

//         // This guard is used when you need to check against a specific resource
//         // The resource should be attached to the request object by a previous middleware/guard
//         const resource = request.resource;
//         const action = request.action || Action.Read;

//         if (resource && !ability.can(action, resource)) {
//             throw new ForbiddenException('Insufficient permissions for this resource');
//         }

//         return true;
//     }
// }


// @Injectable()
// export class AbilitiesResourceGuard<T> implements CanActivate {
//     constructor(
//         private readonly reflector: Reflector,
//         private readonly caslAbilityFactory: AuthAbilityFactory,
//     ) { }

//     async canActivate(context: ExecutionContext): Promise<boolean> {
//         const request = context.switchToHttp().getRequest<AuthenticatedRequest<T>>();
//         const user = request.user;

//         if (!user) {
//             throw new ForbiddenException('User not authenticated');
//         }

//         const ability = this.caslAbilityFactory.createForUser(user);

//         // Get the resource that was loaded by the resource guard
//         const resource = request.resource;
//         const action = null//request.action;

//         // Also check for decorator-based rules
//         const rules = this.reflector.get<RequiredRule[]>(
//             CHECK_ABILITY,
//             context.getHandler(),
//         ) || [];

//         // Check decorator rules first
//         for (const rule of rules) {
//             if (!ability.can(rule.action, rule.subject)) {
//                 throw new ForbiddenException(`Insufficient permissions: cannot ${rule.action} ${rule.subject}`);
//             }
//         }

//         // Check resource-specific permissions if resource exists
//         if (resource && action) {
//             if (!ability.can(action as Action, resource)) {
//                 throw new ForbiddenException(`Insufficient permissions: cannot ${action} this resource`);
//             }
//         }

//         return true;
//     }
// }



// @Injectable()
// export class AbilitiesResourceGuard implements CanActivate {
//     constructor(
//         private reflector: Reflector,
//         private caslAbilityFactory: AuthAbilityFactory,
//     ) { }

//     async canActivate(context: ExecutionContext): Promise<boolean> {
//         const request = context.switchToHttp().getRequest();
//         const user = request.user;

//         if (!user) {
//             throw new ForbiddenException('User not authenticated');
//         }

//         const ability = this.caslAbilityFactory.createForUser(user);

//         // Get the resource that was loaded by the resource guard
//         const resource = request.resource;
//         const action = request.action;

//         // Check decorator-based rules first (if any)
//         const rules = this.reflector.get<RequiredRule[]>(
//             CHECK_ABILITY,
//             context.getHandler(),
//         ) || [];

//         for (const rule of rules) {
//             if (!ability.can(rule.action, rule.subject)) {
//                 throw new ForbiddenException(`Insufficient permissions: cannot ${rule.action} ${rule.subject}`);
//             }
//         }

//         // Check resource-specific permissions (this is the main check)
//         if (resource && action) {
//             if (!ability.can(action as Action, resource)) {
//                 throw new ForbiddenException(`Insufficient permissions: cannot ${action} this resource`);
//             }
//         }

//         return true;
//     }
// }

@Injectable()
export class AbilitiesResourceGuard<T extends Subjects> implements CanActivate {
    constructor(
        private reflector: Reflector,
        private caslAbilityFactory: AuthAbilityFactory,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<AuthenticatedRequest<T>>();
        const user = request.user;

        if (!user) {
            throw new ForbiddenException('User not authenticated');
        }

        const ability = this.caslAbilityFactory.createForUser(user);

        // Get the resource that was loaded by the resource guard
        const resource = request.resource;
        const action = request.action;

        // Check decorator-based rules first (if any)
        const rules = this.reflector.get<RequiredRule[]>(
            CHECK_ABILITY,
            context.getHandler(),
        ) || [];

        for (const rule of rules) {
            if (!ability.can(rule.action, rule.subject)) {
                throw new ForbiddenException(`Insufficient permissions: cannot ${rule.action} ${rule.subject}`);
            }
        }

        // Check resource-specific permissions (this is the main check)
        if (resource && action) {
            if (!ability.can(action as Action, resource)) {
                throw new ForbiddenException(`Insufficient permissions: cannot ${action} this resource`);
            }
        }

        return true;
    }
}

@Injectable()
export class BooksAbilityResourceGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private caslAbilityFactory: AuthAbilityFactory,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<AuthenticatedRequest<BookEntity>>();
        const user = request.user;

        if (!user) {
            throw new ForbiddenException('User not authenticated');
        }

        const ability = this.caslAbilityFactory.createForUser(user);

        // Get the resource that was loaded by the resource guard
        const resource = request.resource;
        const action = request.action;

        // Check decorator-based rules first (if any)
        const rules = this.reflector.get<RequiredRule[]>(
            CHECK_ABILITY,
            context.getHandler(),
        ) || [];

        for (const rule of rules) {
            if (!ability.can(rule.action, rule.subject)) {
                throw new ForbiddenException(`Insufficient permissions: cannot ${rule.action} ${rule.subject}`);
            }
        }

        // Check resource-specific permissions (this is the main check)
        if (resource && action) {
            if (!ability.can(action as Action, resource)) {
                throw new ForbiddenException(`Insufficient permissions: cannot ${action} this resource`);
            }
        }

        return true;
    }
}

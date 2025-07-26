import { Injectable, CanActivate, ExecutionContext, NotFoundException, Inject } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ACTION_KEY } from '../decorators/action.decorator';

@Injectable()
export abstract class BaseResourceGuard<T = any> implements CanActivate {

    constructor(protected readonly reflector: Reflector) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();

        try {
            const resource = await this.loadResource(context);

            if (!resource) {
                throw new NotFoundException(this.getNotFoundMessage());
            }

            // Attach resource to request for use in subsequent guards/controllers
            request.resource = resource;

            // Get action from decorator first, fallback to auto-detection
            request.action = this.getAction(context);

            return true;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new NotFoundException(this.getNotFoundMessage());
        }
    }

    // Abstract methods to be implemented by each module's resource guard
    abstract loadResource(context: ExecutionContext): Promise<T>;
    abstract getNotFoundMessage(): string;

    // Enhanced action detection with decorator support
    protected getAction(context: ExecutionContext): string {
        // First, check if action is explicitly defined via decorator
        const decoratorAction = this.reflector.get<string>(ACTION_KEY, context.getHandler());
        if (decoratorAction) {
            return decoratorAction;
        }

        // Fallback to HTTP method-based detection
        return this.getActionFromHttpMethod(context);
    }

    // Default action detection based on HTTP method
    private getActionFromHttpMethod(context: ExecutionContext): string {
        const request = context.switchToHttp().getRequest();
        const method = request.method.toLowerCase();

        const actionMap: Record<string, string> = {
            'get': 'read',
            'post': 'create',
            'put': 'update',
            'patch': 'update',
            'delete': 'delete',
        };

        return actionMap[method] || 'read';
    }

    // Helper to get route parameters
    protected getParam(context: ExecutionContext, paramName: string): any {
        const request = context.switchToHttp().getRequest();
        return request.params[paramName];
    }

    // Helper to get numeric parameter with validation
    protected getNumericParam(context: ExecutionContext, paramName: string): number {
        const param = this.getParam(context, paramName);
        const numericParam = parseInt(param);

        if (isNaN(numericParam)) {
            throw new NotFoundException(`Invalid ${paramName} parameter`);
        }

        return numericParam;
    }
}

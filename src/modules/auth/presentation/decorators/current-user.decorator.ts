import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { AuthenticatedRequest } from "../types/authenticated-request.types";
import { UserResponsePayload } from "@/modules/users/presentation/contracts/responses/user.response";

export const CurrentUser = createParamDecorator(
    (data: keyof UserResponsePayload, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest<AuthenticatedRequest<any>>();
        const user = request.user;

        return data ? user?.[data] : user;
    },
);
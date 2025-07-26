import { UserResponsePayload } from "@/modules/users/presentation/contracts/responses/user.response";
import { FastifyRequest } from "fastify";

export interface AuthenticatedRequest<T extends any> extends FastifyRequest {
    user: UserResponsePayload,
    resource: T,
    action: string
}
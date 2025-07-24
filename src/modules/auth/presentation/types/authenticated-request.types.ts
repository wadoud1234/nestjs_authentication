import { UserResponsePayload } from "@/modules/users/presentation/contracts/responses/user.response";
import { FastifyRequest } from "fastify";

export interface AuthenticatedRequest extends FastifyRequest {
    user: UserResponsePayload
}
import { UserAuthPayload } from "@/modules/users/presentation/contracts/responses/user-auth.payload";
import { FastifyRequest } from "fastify";

export interface AuthenticatedRequest extends FastifyRequest {
    user: UserAuthPayload
}
import { UserResponsePayload } from "@/modules/users/presentation/contracts/responses/user.response";
import { AuthTokensPayload } from "./auth-tokens.response";
import { SuccessResponsePayload } from "@/shared/presentation/contracts/responses/success.response";

export class AuthResponsePayload {
    constructor(
        public readonly user: UserResponsePayload,
        public readonly tokens: AuthTokensPayload
    ) { }
}

export class AuthResponse extends SuccessResponsePayload<AuthResponsePayload> { }
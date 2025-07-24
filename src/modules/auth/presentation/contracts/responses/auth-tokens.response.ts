import { SuccessResponsePayload } from "@/shared/presentation/contracts/responses/success.response";

export class AuthTokensPayload {
    constructor(
        public readonly accessToken: string,
        public readonly refreshToken: string
    ) { }
}

export class AuthTokensResponse extends SuccessResponsePayload<AuthTokensPayload> { }
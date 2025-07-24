import { AuthJwtPayload } from "../../domain/types/auth-jwt-payload.types";

export interface AuthJwtService {
    sign(payload: AuthJwtPayload): Promise<string>
    verify(token: string): Promise<AuthJwtPayload | null>
}
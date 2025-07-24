import { JwtService, JwtSignOptions, JwtVerifyOptions } from "@nestjs/jwt"
import { AuthJwtService } from "./jwt.service"
import { Inject, Injectable, Provider } from "@nestjs/common"
import { AuthJwtPayload } from "../../domain/types/auth-jwt-payload.types"
import { AppConfigService, InjectAppConfig } from "@/shared/infrastructure/config/app-config.service"

@Injectable()
export class AccessTokenServiceImpl implements AuthJwtService {
    private readonly signOptions: JwtSignOptions
    private readonly verifyOptions: JwtVerifyOptions

    constructor(
        private readonly jwtService: JwtService,
        @InjectAppConfig() appConfig: AppConfigService
    ) {
        const secret = appConfig.ACCESS_TOKEN_SECRET
        const expiresIn = appConfig.ACCESS_TOKEN_EXPIRATION_MS / 1000;
        const issuer = appConfig.JWT_ISSUER
        const audience = appConfig.JWT_AUDIENCE

        this.signOptions = {
            audience,
            issuer,
            secret,
            expiresIn,
            algorithm: "HS256"
        }

        this.verifyOptions = {
            secret,
            audience,
            issuer,
        }
    }

    async sign(payload: AuthJwtPayload) {
        const result = await this.jwtService.signAsync(payload, this.signOptions)
        return result;
    }

    async verify(token: string): Promise<AuthJwtPayload | null> {
        try {
            const result = await this.jwtService.verifyAsync(token, this.verifyOptions)
            return result;
        } catch (error) {
            return null;
        }
    }
}

export const AccessTokenServiceToken = Symbol("AccessTokenService")

export const InjectAccessTokenSevice = () => Inject(AccessTokenServiceToken);

export const AccessTokenServiceProvider: Provider = {
    provide: AccessTokenServiceToken,
    useClass: AccessTokenServiceImpl
}
import { JwtService, JwtSignOptions, JwtVerifyOptions } from "@nestjs/jwt"
import { AuthJwtService } from "./jwt.service"
import { Inject, Injectable, Provider } from "@nestjs/common"
import { AppConfigService, InjectAppConfig } from "@/shared/infrastructure/config/app-config.service"
import { AuthJwtPayload } from "@/modules/auth/_sub-modules/jwts/domain/types/auth-jwt-payload.types"

@Injectable()
export class RefreshTokenServiceImpl implements AuthJwtService {
    private readonly signOptions: JwtSignOptions
    private readonly verifyOptions: JwtVerifyOptions

    constructor(
        private readonly jwtService: JwtService,
        @InjectAppConfig() appConfig: AppConfigService
    ) {
        const secret = appConfig.REFRESH_TOKEN_SECRET
        const expiresIn = appConfig.REFRESH_TOKEN_EXPIRATION_MS / 1000
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

export const RefreshTokenServiceToken = Symbol("RefreshTokenService")

export const InjectRefreshTokenSevice = () => Inject(RefreshTokenServiceToken);

export const RefreshTokenServiceProvider: Provider = {
    provide: RefreshTokenServiceToken,
    useClass: RefreshTokenServiceImpl
}
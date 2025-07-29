import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { BadRequestException, Injectable, Provider } from '@nestjs/common';
import { UserResponsePayload } from '@/modules/users/presentation/contracts/responses/user.response';
import { JwtService } from '@nestjs/jwt';
import { AuthJwtPayload } from '../../domain/types/auth-jwt-payload.types';
import { AppConfigService, InjectAppConfig } from '@/shared/infrastructure/config/app-config.service';

export const RefreshTokenStrategyName = "refresh_token_strategy"

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, RefreshTokenStrategyName) {
    private readonly appConfig: AppConfigService
    constructor(
        @InjectAppConfig() appConfig: AppConfigService,
        private readonly jwtService: JwtService
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            passReqToCallback: true,
            secretOrKey: appConfig.REFRESH_TOKEN_SECRET,
            issuer: appConfig.JWT_ISSUER,
            audience: appConfig.JWT_AUDIENCE
        });
        this.appConfig = appConfig;
    }

    async validate(request: Request, { sub, name, email, role }: AuthJwtPayload): Promise<UserResponsePayload> {
        const refreshToken = request.headers.get("Authorization")?.split("Bearer")[1];
        if (!refreshToken) throw new BadRequestException("Invalid Refresh Token");

        const payload = await this.jwtService.verifyAsync<AuthJwtPayload>(refreshToken, {
            secret: this.appConfig.REFRESH_TOKEN_SECRET
        });
        if (!payload) throw new BadRequestException("Invalid Refresh Token");

        // TODO
        return { id: sub, name, email, roles: [role] };
    }
}

export const RefreshTokenStrategyToken = Symbol("RefreshTokenStrategy")

export const RefreshTokenStrategyProvider: Provider = {
    provide: RefreshTokenStrategyToken,
    useClass: RefreshTokenStrategy
}
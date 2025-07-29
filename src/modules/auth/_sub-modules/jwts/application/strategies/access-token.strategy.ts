import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Provider } from '@nestjs/common';
import { UserResponsePayload } from '@/modules/users/presentation/contracts/responses/user.response';
import { AuthJwtPayload } from '../../domain/types/auth-jwt-payload.types';
import { AppConfigService, InjectAppConfig } from '@/shared/infrastructure/config/app-config.service';

export const AccessTokenStrategyName = "access_token_strategy"

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, AccessTokenStrategyName) {
    constructor(@InjectAppConfig() appConfig: AppConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: appConfig.ACCESS_TOKEN_SECRET,
            issuer: appConfig.JWT_ISSUER,
            audience: appConfig.JWT_AUDIENCE
        });
    }

    async validate({ sub, name, email, role }: AuthJwtPayload): Promise<UserResponsePayload> {
        // TODO
        return { id: sub, name, email, roles: [role] };
    }
}

export const AccessTokenStrategyToken = Symbol("AccessTokenStrategy")

export const AccessTokenStrategyProvider: Provider = {
    provide: AccessTokenStrategyToken,
    useClass: AccessTokenStrategy
}
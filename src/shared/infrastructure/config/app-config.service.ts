import { Inject, Injectable, Provider } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { EnvironmentVariables } from "./validate-env";

export interface AppConfigService extends ConfigService, EnvironmentVariables {
}

@Injectable()
export class AppConfigServiceImpl extends ConfigService implements AppConfigService {

    get DATABASE_URL() {
        return this.getOrThrow<string>("DATABASE_URL")
    }

    get ACCESS_TOKEN_SECRET() {
        return this.getOrThrow<string>("access_token_secret")
    }

    get ACCESS_TOKEN_EXPIRATION_MS() {
        return this.getOrThrow<number>("access_token_expiration_ms")
    }

    get REFRESH_TOKEN_SECRET() {
        return this.getOrThrow<string>("refresh_token_secret")
    }


    get REFRESH_TOKEN_EXPIRATION_MS() {
        return this.getOrThrow<number>("refresh_token_expiration_ms")
    }

    get JWT_ISSUER() {
        return this.getOrThrow<string>("jwt_issuer")
    }

    get JWT_AUDIENCE() {
        return this.getOrThrow<string>("jwt_audience")
    }

    get SESSION_SECRET() {
        return this.getOrThrow<string>("SESSION_SECRET")
    }

    get PORT() {
        return this.getOrThrow<number>("PORT")
    }

    get REDIS_HOST() {
        return this.getOrThrow<string>("REDIS_HOST")
    }

    get REDIS_PORT() {
        return this.getOrThrow<number>("REDIS_PORT")
    }
}

export const AppConfigServiceToken = Symbol("AppConfigService")

export const AppConfigServiceProvider: Provider = {
    provide: AppConfigServiceToken,
    useClass: AppConfigServiceImpl
}

export const InjectAppConfig = () => Inject(AppConfigServiceToken)
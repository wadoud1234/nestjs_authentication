import { plainToInstance, Type } from "class-transformer";
import { IsInt, IsString, validateSync } from "class-validator";
import { config } from "dotenv"
config();

export class EnvironmentVariables {
    @IsString()
    DATABASE_URL: string

    @IsString()
    ACCESS_TOKEN_SECRET: string

    @Type(() => Number)
    @IsInt()
    ACCESS_TOKEN_EXPIRATION_MS: number

    @IsString()
    REFRESH_TOKEN_SECRET: string

    @Type(() => Number)
    @IsInt()
    REFRESH_TOKEN_EXPIRATION_MS: number

    @IsString()
    JWT_ISSUER: string

    @IsString()
    JWT_AUDIENCE: string

    @IsString()
    SESSION_SECRET: string

    @IsInt()
    PORT: number

    @IsString()
    REDIS_HOST: string

    @IsInt()
    REDIS_PORT: number
}

export default async function validateEnv(config: EnvironmentVariables) {
    const validateConfig = plainToInstance(EnvironmentVariables, config, {
        enableImplicitConversion: true
    });

    const errors = validateSync(validateConfig, {
        skipMissingProperties: false
    })

    if (errors.length > 0) {
        throw new Error(errors.toString());
    }

    return validateConfig;
}
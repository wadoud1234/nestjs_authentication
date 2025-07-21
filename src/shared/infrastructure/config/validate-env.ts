import { plainToInstance } from "class-transformer";
import { IsString, validateSync } from "class-validator";
import { config } from "dotenv"
config();

class EnvironmentVariables {
    @IsString()
    DATABASE_URL: string
}

export default async function validateEnv(config: Record<string, unknown>) {
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
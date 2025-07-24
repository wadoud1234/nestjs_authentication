import { BadRequestException, Inject, Injectable, InternalServerErrorException, Logger, Provider, Scope } from "@nestjs/common"
import { argon2id, hash, Options, verify } from "argon2"

export interface PasswordHasher {
    hash(password: string): Promise<string>
    verify(hashed: string, rawPassword: string): Promise<boolean>
}

@Injectable()
export class Argon2PasswordHasher implements PasswordHasher {
    private readonly logger = new Logger(Argon2PasswordHasher.name);
    private readonly options: Options;

    constructor() {
        this.options = {
            type: argon2id, // Use Argon2id variant
            memoryCost: 2 ** 16,   // Memory cost in KiB (64 MB) - m-cost
            timeCost: 4,          // Iteration count (t-cost)
            parallelism: 1,       // Number of threads/lanes (p-cost)
            hashLength: 32,       // Recommended hash length in bytes
        };
        this.logger.log(`Argon2PasswordHasher initialized with options: ${JSON.stringify(this.options)}`);
    }

    async hash(password: string): Promise<string> {
        try {
            return await hash(password, this.options)
        } catch (error) {
            throw new InternalServerErrorException('Failed to hash password due to an internal server error.');
        }
    }

    async verify(hashed: string, rawPassword: string): Promise<boolean> {
        try {
            return await verify(hashed, rawPassword);
        } catch (error) {
            if (error instanceof Error && error.message.includes('Invalid hash')) {
                // throw new BadRequestException('Invalid hashed password format.');
                return false
            }
            return false
            // throw new InternalServerErrorException('Failed to verify password due to an internal server error.');

        }
    }
}

const PasswordHasherToken = Symbol("PasswordHasher")

export const InjectPasswordHasher = () => Inject(PasswordHasherToken)

export const PasswordHasherProvider: Provider = {
    provide: PasswordHasherToken,
    useClass: Argon2PasswordHasher
}
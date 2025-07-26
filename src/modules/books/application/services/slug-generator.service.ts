import { Inject, Injectable, Provider } from "@nestjs/common";
import generate from "slugify";

interface GenerateSlugOptions {
    replacement?: string;
    remove?: RegExp;
    lower?: boolean;
    strict?: boolean;
    locale?: string;
    trim?: boolean;
}

export interface SlugGeneratorService {
    generate(title: string, options?: GenerateSlugOptions | undefined): string
}

@Injectable()
export class SlugGeneratorServiceImpl implements SlugGeneratorService {
    private options: GenerateSlugOptions
    constructor() {
        this.options = {
            lower: true,
            replacement: '-',
            strict: true, // Remove all characters that are not A-Z, a-z, 0-9
            trim: true,   // Trim leading/trailing hyphens
        }
    }

    generate(title: string, options: GenerateSlugOptions | undefined = undefined): string {
        if (options) {
            return generate(title, options)
        }
        return generate(title, this.options)
    }
}

export const SlugGeneratorServiceToken = Symbol("SlugGeneratorService")

export const InjectSlugGenerator = () => Inject(SlugGeneratorServiceToken)

export const SlugGeneratorServiceProvider: Provider = {
    provide: SlugGeneratorServiceToken,
    useClass: SlugGeneratorServiceImpl
}
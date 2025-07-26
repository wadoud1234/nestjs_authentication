import { ExecutionContext } from "@nestjs/common";

export interface ResourceLoader<T> {
    loadResource(context: ExecutionContext): Promise<T>;
}
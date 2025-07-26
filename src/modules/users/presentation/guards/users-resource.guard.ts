import { BaseResourceGuard } from "@/modules/auth/_sub-modules/access-control/presentation/guards/base-resource.guard";
import { BadRequestException, ExecutionContext, Injectable } from "@nestjs/common";
import { UserEntity } from "../../domain/entities/user.entity";
import { Database, InjectDatabase } from "@/shared/infrastructure/database/database.module";
import { usersTable } from "@/shared/infrastructure/database/schema/users.table";
import { eq } from "drizzle-orm";
import { Reflector } from "@nestjs/core";

@Injectable()
export class UserResourceGuard extends BaseResourceGuard<UserEntity> {
    constructor(
        protected readonly reflector: Reflector,
        @InjectDatabase() private readonly database: Database) {
        super(reflector);
    }

    async loadResource(context: ExecutionContext): Promise<UserEntity> {
        const userId = this.getParam(context, 'id');

        if (typeof userId !== "string" || userId.trim().length <= 0) {
            throw new BadRequestException("User not found (Invalid UserID)")
        }

        const [result] = await this.database.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1)
        return result;
    }

    getNotFoundMessage(): string {
        return 'User not found';
    }
}
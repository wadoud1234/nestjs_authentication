import { BaseResourceGuard } from '@/modules/auth/_sub-modules/access-control/presentation/guards/base-resource.guard';
import { Database, InjectDatabase } from '@/shared/infrastructure/database/database.module';
import { booksTable } from '@/shared/infrastructure/database/schema/books.table';
import { Injectable, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { eq } from 'drizzle-orm';
import { BookEntity } from '../../domain/entities/book.entity';

@Injectable()
export class ArticlesResourceGuard extends BaseResourceGuard<BookEntity> {
    constructor(
        protected readonly reflector: Reflector,
        @InjectDatabase() private readonly database: Database
    ) {
        super(reflector);
    }

    async loadResource(context: ExecutionContext): Promise<BookEntity> {
        const bookId = this.getParam(context, 'id');
        const [result] = await this.database
            .select()
            .from(booksTable)
            .where(eq(booksTable.id, bookId));

        return result;
    }

    getNotFoundMessage(): string {
        return 'Article not found';
    }
}
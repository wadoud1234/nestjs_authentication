import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateCategoryCommand } from "./create-category.command";
import { CreateCategoryResult } from "./create-category.result";
import { Provider } from "@nestjs/common";
import { Database, InjectDatabase } from "@/shared/infrastructure/database/database.module";
import { categoriesTable } from "@/shared/infrastructure/database/schema/books/categories.table";
import { eq } from "drizzle-orm";
import { CategoryAlreadyExist } from "@/modules/categories/domain/exceptions/category-already-exist.exception";

export interface CreateCategoryCommandHandler extends ICommandHandler<CreateCategoryCommand> { }

@CommandHandler(CreateCategoryCommand)
export class CreateCategoryCommandHandlerImpl implements CreateCategoryCommandHandler {
    constructor(
        @InjectDatabase() private readonly database: Database
    ) { }

    async execute({ name, description }: CreateCategoryCommand): Promise<CreateCategoryResult> {
        // Verify that category dont exist already
        const [isCategoryExist] = await this.database
            .select({ id: categoriesTable.id })
            .from(categoriesTable)
            .where(eq(categoriesTable.name, name))
            .limit(1);

        if (isCategoryExist && isCategoryExist.id) {
            throw new CategoryAlreadyExist()
        }

        const [newCategory] = await this.database
            .insert(categoriesTable)
            .values({
                name,
                description
            })
            .returning()

        return newCategory;
    }
}

export const CreateCategoryCommandHandlerToken = Symbol('CreateCategoryCommandHandler')

export const CreateCategoryCommandHandlerProvider: Provider = {
    provide: CreateCategoryCommandHandlerToken,
    useClass: CreateCategoryCommandHandlerImpl
}
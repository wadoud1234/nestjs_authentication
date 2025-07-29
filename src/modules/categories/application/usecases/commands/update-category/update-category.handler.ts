import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Provider } from "@nestjs/common";
import { Database, InjectDatabase } from "@/shared/infrastructure/database/database.module";
import { categoriesTable } from "@/shared/infrastructure/database/schema/books/categories.table";
import { eq } from "drizzle-orm";
import { CategoryAlreadyExist } from "@/modules/categories/domain/exceptions/category-already-exist.exception";
import { UpdateCategoryCommand } from "./update-category.command";
import { UpdateCategoryCommandResult } from "./update-category.result";
import { CategoriesRepository, InjectCategoriesRepository } from "../../../../infrastructure/repositories/categories.repository";
import { CategoryNotFoundException } from "@/modules/categories/domain/exceptions/category-not-found.exception";

export interface UpdateCategoryCommandHandler extends ICommandHandler<UpdateCategoryCommand> { }

@CommandHandler(UpdateCategoryCommand)
export class UpdateCategoryCommandHandlerImpl implements UpdateCategoryCommandHandler {
    constructor(
        @InjectDatabase() private readonly database: Database,
        @InjectCategoriesRepository() private readonly categoriesRepository: CategoriesRepository
    ) { }

    async execute({ id, name, description }: UpdateCategoryCommand): Promise<UpdateCategoryCommandResult> {
        // Verify that category dont exist already

        const updatedCategory = await this.database.transaction(async (tx) => {
            const findBookWhereCondition = eq(categoriesTable.id, id);

            const oldCategory = await this.categoriesRepository.findFullCategoryByWhere(findBookWhereCondition, tx);

            if (!oldCategory) {
                throw new CategoryNotFoundException();
            }

            const updated = await this.categoriesRepository.updateCategory(id, { name, description }, tx);

            return updated
        })

        return updatedCategory
    }
}

export const UpdateCategoryCommandHandlerToken = Symbol('UpdateCategoryCommandHandler')

export const UpdateCategoryCommandHandlerProvider: Provider = {
    provide: UpdateCategoryCommandHandlerToken,
    useClass: UpdateCategoryCommandHandlerImpl
}
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Provider } from "@nestjs/common";
import { Database, InjectDatabase } from "@/shared/infrastructure/database/database.module";
import { categoriesTable } from "@/shared/infrastructure/database/schema/categories.table";
import { eq } from "drizzle-orm";
import { CategoriesService, InjectCategoriesService } from "../../../services/categories.service";
import { CategoryNotFoundException } from "@/modules/categories/domain/exceptions/category-not-found.exception";
import { DeleteCategoryCommand } from "./delete-category.command";
import { DeleteCategoryCommandResult } from "./delete-category.result";

export interface DeleteCategoryCommandHandler extends ICommandHandler<DeleteCategoryCommand> { }

@CommandHandler(DeleteCategoryCommand)
export class DeleteCategoryCommandHandlerImpl implements DeleteCategoryCommandHandler {
    constructor(
        @InjectDatabase() private readonly database: Database,
        @InjectCategoriesService() private readonly categoriesService: CategoriesService
    ) { }

    async execute({ id }: DeleteCategoryCommand): Promise<DeleteCategoryCommandResult> {
        // Verify that category dont exist already

        await this.database.transaction(async (tx) => {
            const findBookWhereCondition = eq(categoriesTable.id, id);

            const category = await this.categoriesService.findFullCategoryByWhere(findBookWhereCondition, tx);

            if (!category) {
                throw new CategoryNotFoundException();
            }

            await this.categoriesService.deleteCategory(id, tx);
        })

        return {};
    }
}

export const DeleteCategoryCommandHandlerToken = Symbol('DeleteCategoryCommandHandler')

export const DeleteCategoryCommandHandlerProvider: Provider = {
    provide: DeleteCategoryCommandHandlerToken,
    useClass: DeleteCategoryCommandHandlerImpl
}
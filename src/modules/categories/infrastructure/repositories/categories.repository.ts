import { Database, InjectDatabase } from "@/shared/infrastructure/database/database.module";
import { Inject, Injectable, Provider } from "@nestjs/common";
import { eq, SQL } from "drizzle-orm";
import { CategoryEntity } from "../../domain/entities/category.entity";
import { DatabaseTransaction } from "@/shared/infrastructure/database/providers/transaction-manager.provider";
import { categoriesTable } from "@/shared/infrastructure/database/schema/books/categories.table";

export interface CategoriesRepository {
    findFullCategoryByWhere(where: SQL, tx: DatabaseTransaction): Promise<CategoryEntity | null>
    findFullCategoryByWhere(where: SQL): Promise<CategoryEntity | null>

    updateCategory(categoryId: string, input: Omit<CategoryEntity, "id" | "createdAt" | "updatedAt" | "deletedAt">, tx: DatabaseTransaction): Promise<CategoryEntity>
    updateCategory(categoryId: string, input: Omit<CategoryEntity, "id" | "createdAt" | "updatedAt" | "deletedAt">): Promise<CategoryEntity>

    deleteCategory(categoryId: string, tx: DatabaseTransaction): Promise<void>
    deleteCategory(categoryId: string, tx: void): Promise<void>

    isCategoryExistByWhere(where: SQL, tx: DatabaseTransaction): Promise<boolean>
    isCategoryExistByWhere(where: SQL, tx: void): Promise<boolean>

    findCategoriesByWhere(where: SQL, tx: void): Promise<{ id: string; name: string; }[]>
    findCategoriesByWhere(where: SQL, tx: DatabaseTransaction): Promise<{ id: string; name: string; }[]>
}

@Injectable()
export class CategoriesRepositoryImpl implements CategoriesRepository {

    constructor(
        @InjectDatabase() private readonly database: Database
    ) { }

    async findCategoriesByWhere(where: SQL, tx: DatabaseTransaction | void): Promise<{ id: string; name: string; }[]> {
        return (tx || this.database).query.categoriesTable.findMany({
            where,
            columns: {
                id: true,
                name: true
            }
        })
    }

    async isCategoryExistByWhere(where: SQL, tx: DatabaseTransaction | void) {
        const category = await (tx || this.database).query.categoriesTable.findFirst({
            where,
            columns: { id: true }
        })

        if (!category) {
            return false
        }
        return true
    }


    async findFullCategoryByWhere(where: SQL, tx: DatabaseTransaction | void): Promise<CategoryEntity | null> {
        const category = await (tx || this.database).query.categoriesTable.findFirst({ where })
        if (!category) return null
        return category
    }

    async updateCategory(categoryId: string, input: Omit<CategoryEntity, "id" | "createdAt" | "updatedAt" | "deletedAt">, tx: DatabaseTransaction | void): Promise<CategoryEntity> {
        return await (tx || this.database)
            .update(categoriesTable)
            .set({
                name: input.name,
                description: input.description,
                updatedAt: new Date()
            })
            .where(eq(categoriesTable.id, categoryId))
            .returning().then(result => result?.[0]);
    }

    async deleteCategory(categoryId: string, tx: DatabaseTransaction | void): Promise<void> {
        await (tx || this.database)
            .delete(categoriesTable)
            .where(eq(categoriesTable.id, categoryId))
    }
}

export const CategoriesRepositoryToken = Symbol("CategoriesRepository");

export const InjectCategoriesRepository = () => Inject(CategoriesRepositoryToken)

export const CategoriesRepositoryProvider: Provider = {
    provide: CategoriesRepositoryToken,
    useClass: CategoriesRepositoryImpl
}
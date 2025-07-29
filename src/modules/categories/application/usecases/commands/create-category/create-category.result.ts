import { CategoryEntity } from "@/modules/categories/domain/entities/category.entity";
import { CategoryResponsePayload } from "@/modules/categories/presentation/contracts/responses/category.response";
import { categoriesTable } from "@/shared/infrastructure/database/schema/books/categories.table";

export class CreateCategoryResult extends CategoryEntity { }
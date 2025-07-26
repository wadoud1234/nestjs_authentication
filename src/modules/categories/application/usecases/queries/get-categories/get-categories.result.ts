import { CategoryEntity } from "@/modules/categories/domain/entities/category.entity";
import { PaginatedResponsePayload } from "@/shared/presentation/contracts/responses/paginated.response";

export class GetCategoriesQueryResult extends PaginatedResponsePayload<CategoryEntity> { }
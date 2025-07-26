import { Provider } from "@nestjs/common";
import { CreateCategoryCommandHandlerProvider } from "../application/usecases/commands/create-category/create-category.handler";
import { GetCategoriesQueryHandlerProvider } from "../application/usecases/queries/get-categories/get-categories.handler";

export const CategoriesModuleCommandHandlers: Provider[] = [
    CreateCategoryCommandHandlerProvider
]

export const CategoriesModuleQueryHandlers: Provider[] = [
    GetCategoriesQueryHandlerProvider
] 
import { Provider } from "@nestjs/common";
import { CreateCategoryCommandHandlerProvider } from "../application/usecases/commands/create-category/create-category.handler";
import { GetCategoriesQueryHandlerProvider } from "../application/usecases/queries/get-categories/get-categories.handler";
import { UpdateCategoryCommandHandlerProvider } from "../application/usecases/commands/update-category/update-category.handler";
import { DeleteCategoryCommandHandlerProvider } from "../application/usecases/commands/delete-category/delete-category.handler";
import { CategoriesRepositoryProvider } from "./repositories/categories.repository";

export const CategoriesModuleCommandHandlers: Provider[] = [
    CreateCategoryCommandHandlerProvider,
    UpdateCategoryCommandHandlerProvider,
    DeleteCategoryCommandHandlerProvider
]

export const CategoriesModuleQueryHandlers: Provider[] = [
    GetCategoriesQueryHandlerProvider
]

export const CategoriesModuleServices: Provider[] = [
]

export const CategoriesModuleRepositories: Provider[] = [
    CategoriesRepositoryProvider
]
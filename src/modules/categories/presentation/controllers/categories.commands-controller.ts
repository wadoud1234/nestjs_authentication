import { Body, Controller, Delete, HttpCode, HttpStatus, Param, Post, Put } from "@nestjs/common";
import { CreateCategoryRequestBody } from "../contracts/requests/create-category.request";
import { CreateCategoryCommand } from "../../application/usecases/commands/create-category/create-category.command";
import { CommandBus } from "@nestjs/cqrs";
import { UpdateCategoryRequestBody, UpdateCategoryRequestParams } from "../contracts/requests/update-category.request";
import { UpdateCategoryCommand } from "../../application/usecases/commands/update-category/update-category.command";
import { Public } from "@/modules/auth/presentation/decorators/is-public.decorator";
import { DeleteCategoryRequestParams } from "../contracts/requests/delete-category.request";
import { DeleteCategoryCommand } from "../../application/usecases/commands/delete-category/delete-category.command";
import { HasPermission } from "@/modules/auth/_sub-modules/access-control/presentation/decorators/has-permission.decorator";
import { PermissionsEnum } from "@/shared/infrastructure/database/schema/identity/permissions.table";

@Public()
@Controller("categories")
export class CategoriesCommandsController {

    constructor(
        private readonly commandBus: CommandBus
    ) { }

    @HasPermission(PermissionsEnum.CATEGORY_CREATE)
    @HttpCode(HttpStatus.CREATED)
    @Post()
    async create(@Body() body: CreateCategoryRequestBody) {
        return {
            data: await this.commandBus.execute(CreateCategoryCommand.from(body))
        }
    }

    @HasPermission(PermissionsEnum.CATEGORY_EDIT)
    @Put(":id")
    async update(
        @Body() body: UpdateCategoryRequestBody,
        @Param() params: UpdateCategoryRequestParams
    ) {
        return {
            data: await this.commandBus.execute(UpdateCategoryCommand.from(body, params))
        }
    }

    @HasPermission(PermissionsEnum.CATEGORY_DELETE)
    @HttpCode(HttpStatus.NO_CONTENT)
    @Delete(":id")
    async delete(
        @Param() params: DeleteCategoryRequestParams
    ) {
        return {
            data: await this.commandBus.execute(DeleteCategoryCommand.from(params))
        }
    }
}
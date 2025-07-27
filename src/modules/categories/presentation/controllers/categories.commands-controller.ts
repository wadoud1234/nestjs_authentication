import { Body, Controller, Delete, HttpCode, HttpStatus, Param, Post, Put } from "@nestjs/common";
import { CreateCategoryRequestBody } from "../contracts/requests/create-category.request";
import { CreateCategoryCommand } from "../../application/usecases/commands/create-category/create-category.command";
import { CommandBus } from "@nestjs/cqrs";
import { UpdateCategoryRequestBody, UpdateCategoryRequestParams } from "../contracts/requests/update-category.request";
import { UpdateCategoryCommand } from "../../application/usecases/commands/update-category/update-category.command";
import { Public } from "@/modules/auth/presentation/decorators/is-public.decorator";
import { DeleteCategoryRequestParams } from "../contracts/requests/delete-category.request";
import { DeleteCategoryCommand } from "../../application/usecases/commands/delete-category/delete-category.command";

@Public()
@Controller("categories")
export class CategoriesCommandsController {

    constructor(
        private readonly commandBus: CommandBus
    ) { }

    @HttpCode(HttpStatus.CREATED)
    @Post()
    async create(@Body() body: CreateCategoryRequestBody) {
        return {
            data: await this.commandBus.execute(CreateCategoryCommand.from(body))
        }
    }

    @Put(":id")
    async update(
        @Body() body: UpdateCategoryRequestBody,
        @Param() params: UpdateCategoryRequestParams
    ) {
        return {
            data: await this.commandBus.execute(UpdateCategoryCommand.from(body, params))
        }
    }

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
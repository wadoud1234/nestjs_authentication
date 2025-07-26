import { Body, Controller, Post } from "@nestjs/common";
import { CreateCategoryRequestBody } from "../contracts/requests/create-category.request";
import { CreateCategoryCommand } from "../../application/usecases/commands/create-category/create-category.command";
import { CommandBus } from "@nestjs/cqrs";

@Controller("categories")
export class CategoriesCommandsController {

    constructor(
        private readonly commandBus: CommandBus
    ) { }

    @Post()
    async create(@Body() body: CreateCategoryRequestBody) {
        return {
            data: await this.commandBus.execute(CreateCategoryCommand.from(body))
        }
    }
}
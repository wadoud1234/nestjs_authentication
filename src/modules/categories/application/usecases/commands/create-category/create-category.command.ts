import { Command } from "@nestjs/cqrs";
import { CreateCategoryResult } from "./create-category.result";
import { CreateCategoryRequestBody } from "@/modules/categories/presentation/contracts/requests/create-category.request";

export class CreateCategoryCommand extends Command<CreateCategoryResult> {
    constructor(
        public readonly name: string,
        public readonly description: string
    ) {
        super()
    }

    public static from(body: CreateCategoryRequestBody) {
        return new CreateCategoryCommand(
            body.name,
            body.description
        );
    }
}
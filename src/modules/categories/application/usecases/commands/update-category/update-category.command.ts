import { Command } from "@nestjs/cqrs";
import { UpdateCategoryCommandResult } from "./update-category.result";
import { UpdateCategoryRequestBody, UpdateCategoryRequestParams } from "@/modules/categories/presentation/contracts/requests/update-category.request";

export class UpdateCategoryCommand extends Command<UpdateCategoryCommandResult> {
    constructor(
        public readonly id: string,
        public readonly name: string,
        public readonly description: string
    ) {
        super()
    }

    public static from(
        body: UpdateCategoryRequestBody,
        params: UpdateCategoryRequestParams
    ) {
        return new UpdateCategoryCommand(
            params.id,
            body.name,
            body.description
        );
    }
}
import { Command } from "@nestjs/cqrs";
import { DeleteCategoryCommandResult } from "./delete-category.result";
import { DeleteCategoryRequestParams } from "@/modules/categories/presentation/contracts/requests/delete-category.request";

export class DeleteCategoryCommand extends Command<DeleteCategoryCommandResult> {
    constructor(
        public readonly id: string,
    ) {
        super()
    }

    public static from(
        params: DeleteCategoryRequestParams
    ) {
        return new DeleteCategoryCommand(params.id);
    }
}
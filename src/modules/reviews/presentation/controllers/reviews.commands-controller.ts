import { Body, Controller, Delete, HttpCode, HttpStatus, Param, Post, Put } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { UpdateReviewRequestBody, UpdateReviewRequestParams } from "../contracts/requests/update-review.request";
import { UpdateReviewCommand } from "../../application/usecases/commands/update-review/update-review.command";
import { DeleteReviewRequestParams } from "../contracts/requests/delete-review.request";
import { DeleteReviewCommand } from "../../application/usecases/commands/delete-review/delete-review.command";

@Controller("reviews")
export class ReviewsCommandsController {

    constructor(
        private readonly commandBus: CommandBus
    ) { }

    @Put(":reviewId")
    async update(
        @Body() body: UpdateReviewRequestBody,
        @Param() params: UpdateReviewRequestParams
    ) {
        return {
            data: await this.commandBus.execute(UpdateReviewCommand.from(body, params))
        }
    }

    @HttpCode(HttpStatus.NO_CONTENT)
    @Delete(":reviewId")
    async delete(
        @Param() params: DeleteReviewRequestParams
    ) {
        return {
            data: await this.commandBus.execute(DeleteReviewCommand.from(params))
        }
    }

}
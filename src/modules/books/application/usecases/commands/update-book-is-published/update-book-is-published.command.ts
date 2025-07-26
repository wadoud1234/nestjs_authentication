import { Command } from "@nestjs/cqrs";
import { UpdateBookIsPublishedCommandResult } from "./update-book-is-published.result";
import { UpdateBookIsPublishedRequestBody, UpdateBookIsPublishedRequestParams } from "@/modules/books/presentation/contracts/requests/update-book-publish.request";

export class UpdateBookIsPublishedCommand extends Command<UpdateBookIsPublishedCommandResult> {
    constructor(
        public readonly id: string,
        public readonly isPublished: boolean
    ) {
        super()
    }

    public static from(
        body: UpdateBookIsPublishedRequestBody,
        params: UpdateBookIsPublishedRequestParams
    ) {
        return new UpdateBookIsPublishedCommand(params.id, body.isPublished)
    }
}
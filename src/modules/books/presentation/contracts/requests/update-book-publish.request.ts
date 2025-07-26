import { IsBoolean, IsString, IsUUID } from "class-validator";

export class UpdateBookIsPublishedRequestBody {
    @IsBoolean()
    isPublished: boolean
}

export class UpdateBookIsPublishedRequestParams {
    @IsUUID()
    @IsString()
    id: string
}
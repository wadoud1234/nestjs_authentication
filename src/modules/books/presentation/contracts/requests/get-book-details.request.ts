import { IsString, IsUUID } from "class-validator";

export class GetBookDetailsRequestParamsBySlug {
    @IsString()
    bookSlug: string
}

export class GetBookDetailsRequestParamsById {
    @IsUUID()
    @IsString()
    id: string
}
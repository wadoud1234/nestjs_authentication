import { Transform, Type } from "class-transformer";
import { IsArray, IsBoolean, IsBooleanString, IsEnum, IsNumber, IsOptional, IsString, IsUUID, isUUID } from "class-validator";

export enum BooksSortBy {
    CREATED_AT = "createdAt",
    TITLE = "title",
    PRICE = "price",
    RATING = "rating"
}

export enum BooksSortOrder {
    ASC = "asc",
    DESC = "desc"
}

export class GetBooksRequestQuery {
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    page: number = 1

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    size: number = 10

    @IsOptional()
    @Type(() => String)
    @IsString()
    search: string = ""

    @IsOptional()
    @Type(() => String)
    @IsString()
    authorName: string = ""

    @IsOptional()
    @Transform(({ value }: { value: string }) => {
        if (!value) return [];
        // Split comma-separated string into array
        const result = value.split(',').map(id => id.trim()).filter(id => isUUID(id));
        return result;
    })
    @IsArray()
    @IsString({ each: true })
    categoryIds: string[] = [];

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    minPrice: number = 0

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    maxPrice?: number = undefined

    @IsOptional()
    @Type(() => String)
    @IsEnum(BooksSortBy)
    sortBy: BooksSortBy = BooksSortBy.CREATED_AT

    @IsOptional()
    @Type(() => String)
    @IsEnum(BooksSortOrder)
    sortOrder: BooksSortOrder = BooksSortOrder.ASC

    @IsOptional()
    @Type(() => String)
    @IsString()
    excludeBookId: string = ""

    @IsOptional()
    @Transform(({ value }) => {
        if (value === undefined || value === null || value === '') {
            return undefined; // Show all books
        }

        const strValue = String(value).toLowerCase();
        if (strValue === 'true') {
            return true; // Only published
        }
        if (strValue === 'false') {
            return false; // Only unpublished
        }
        return undefined; // Invalid value = show all
    })
    isPublished?: boolean; // undefined means show all
}
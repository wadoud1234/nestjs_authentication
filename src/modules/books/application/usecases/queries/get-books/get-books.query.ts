import { IQuery, Query } from "@nestjs/cqrs";
import { GetBooksQueryResult } from "./get-books.result";
import { BooksSortBy, BooksSortOrder, GetBooksRequestQuery } from "@/modules/books/presentation/contracts/requests/get-books.request";
import { UserEntity } from "@/modules/users/domain/entities/user.entity";

export class GetBooksQuery extends Query<GetBooksQueryResult> {
    constructor(
        public readonly page: number,
        public readonly size: number,
        public readonly search: string,
        public readonly authorName: string,
        public readonly categoryIds: string[],
        public readonly minPrice: number,
        public readonly maxPrice: number | null,
        public readonly sortBy: BooksSortBy,
        public readonly sortOrder: BooksSortOrder,
        public readonly excludeBookId: string,
        public readonly isPublished?: boolean,
        public readonly currentUserId?: string
    ) {
        super()
    }

    public static from(
        request: GetBooksRequestQuery,
        currentUser?: UserEntity
    ) {
        return new GetBooksQuery(
            request.page,
            request.size,
            request.search,
            request.authorName,
            request.categoryIds,
            request.minPrice,
            request.maxPrice ? request.maxPrice : null,
            request.sortBy,
            request.sortOrder,
            request.excludeBookId,
            request.isPublished,
            currentUser?.id
        )
    }

    get offset() {
        return (this.page - 1) * this.size
    }
}
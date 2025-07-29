import { QueryHandler, IQueryHandler } from "@nestjs/cqrs";
import { Provider } from "@nestjs/common";
import { Database, InjectDatabase } from "@/shared/infrastructure/database/database.module";
import { categoriesTable } from "@/shared/infrastructure/database/schema/books/categories.table";
import { eq } from "drizzle-orm";
import { CategoryNotFoundException } from "@/modules/categories/domain/exceptions/category-not-found.exception";
import { GetWishlistQuery } from "./get-wishlist.query";
import { GetWishlistQueryResult } from "./get-wishlist.result";
import { wishlistItemsTable } from "@/shared/infrastructure/database/schema/user-engagement/wishlist-items.table";
import { bookDetailsWithoutTimestampsColumns } from "@/modules/books/infrastructure/repositories/helpers/columns/book-details-without-timestamps.columns";
import { authorColumns } from "@/modules/users/infrastructure/repositories/helpers/columns/author.columns";

export interface GetWishlistQueryHandler extends IQueryHandler<GetWishlistQuery> { }

@QueryHandler(GetWishlistQuery)
export class GetWishlistQueryHandlerImpl implements GetWishlistQueryHandler {
    constructor(
        @InjectDatabase() private readonly database: Database,
    ) { }

    async execute({ userId }: GetWishlistQuery): Promise<GetWishlistQueryResult> {
        // Verify that category dont exist already

        const whereCondition = eq(wishlistItemsTable.userId, userId);

        const wishlist = await this.database.query.wishlistItemsTable.findMany({
            where: whereCondition,
            columns: {
                addedAt: true,
            },
            with: {
                book: {
                    columns: bookDetailsWithoutTimestampsColumns(),
                    with: {
                        author: {
                            columns: authorColumns()
                        }
                    }
                },
            }
        })

        return wishlist;
    }
}

export const GetWishlistQueryHandlerToken = Symbol('GetWishlistQueryHandler')

export const GetWishlistQueryHandlerProvider: Provider = {
    provide: GetWishlistQueryHandlerToken,
    useClass: GetWishlistQueryHandlerImpl
}
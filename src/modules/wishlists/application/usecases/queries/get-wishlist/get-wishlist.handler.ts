import { QueryHandler, IQueryHandler } from "@nestjs/cqrs";
import { Provider } from "@nestjs/common";
import { Database, InjectDatabase } from "@/shared/infrastructure/database/database.module";
import { categoriesTable } from "@/shared/infrastructure/database/schema/categories.table";
import { eq } from "drizzle-orm";
import { CategoryNotFoundException } from "@/modules/categories/domain/exceptions/category-not-found.exception";
import { GetWishlistQuery } from "./get-wishlist.query";
import { GetWishlistQueryResult } from "./get-wishlist.result";
import { wishlistItemsTable } from "@/shared/infrastructure/database/schema/wishlist-items.table";

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
                    columns: {
                        id: true,
                        title: true,
                        description: true,
                        price: true,
                        rating: true,
                        stock: true,
                        isbn: true,
                        slug: true,
                        isPublished: true,
                        pages: true,
                    },
                    with: {
                        author: {
                            columns: {
                                id: true,
                                name: true
                            }
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
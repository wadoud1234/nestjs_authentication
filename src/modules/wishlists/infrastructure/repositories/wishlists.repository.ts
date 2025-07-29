import { Database, InjectDatabase } from "@/shared/infrastructure/database/database.module";
import { DatabaseTransaction } from "@/shared/infrastructure/database/providers/transaction-manager.provider";
import { wishlistItemsTable } from "@/shared/infrastructure/database/schema/user-engagement/wishlist-items.table";
import { Inject, Injectable, Provider } from "@nestjs/common";
import { eq, SQL } from "drizzle-orm";

export interface WishlistsRepository {
    getWishlistItemIdByWhere(where: SQL | undefined, tx: DatabaseTransaction): Promise<{ id: string } | null>
    getWishlistItemIdByWhere(where: SQL | undefined, tx: void): Promise<{ id: string } | null>

    addToWishlist(bookId: string, userId: string, tx: DatabaseTransaction): Promise<void>
    addToWishlist(bookId: string, userId: string, tx: void): Promise<void>

    removeFromWishlist(wishlistItemId: string, tx: DatabaseTransaction): Promise<void>
    removeFromWishlist(wishlistItemId: string, tx: void): Promise<void>

}

@Injectable()
export class WishlistsRepositoryImpl implements WishlistsRepository {

    constructor(
        @InjectDatabase() private readonly database: Database
    ) { }

    async getWishlistItemIdByWhere(where: SQL | undefined, tx: DatabaseTransaction | void) {
        const wishlistItem = await (tx || this.database).query.wishlistItemsTable.findFirst({
            where,
            columns: {
                id: true
            }
        })
        if (!wishlistItem) return null
        return wishlistItem
    }

    async addToWishlist(bookId: string, userId: string, tx: DatabaseTransaction | void) {
        await (tx || this.database)
            .insert(wishlistItemsTable)
            .values({
                bookId,
                userId,
            })
    }

    async removeFromWishlist(wishlistItemId: string, tx: DatabaseTransaction | void) {
        await (tx || this.database)
            .delete(wishlistItemsTable)
            .where(eq(wishlistItemsTable.id, wishlistItemId))
    }
}

export const WishlistsRepositoryToken = Symbol("WishlistsRepositoryProvider");

export const InjectWishlistsRepository = () => Inject(WishlistsRepositoryToken)

export const WishlistsRepositoryProvider: Provider = {
    provide: WishlistsRepositoryToken,
    useClass: WishlistsRepositoryImpl
}
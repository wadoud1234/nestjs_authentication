import { Database, InjectDatabase } from "@/shared/infrastructure/database/database.module";
import { DatabaseTransaction } from "@/shared/infrastructure/database/providers/transaction-manager.provider";
import { cartItemsTable } from "@/shared/infrastructure/database/schema/commerce/cart-items.table";
import { Inject, Injectable, Provider } from "@nestjs/common";
import { eq, SQL } from "drizzle-orm";

export interface CartItemsRepository {
    updateCartItemQuantityById(cartItemId: string, quantity: number, tx: void): Promise<number>
    updateCartItemQuantityById(cartItemId: string, quantity: number, tx: DatabaseTransaction): Promise<number>

    findCartItemWithQuantityById(cartItemId: string, tx: void): Promise<{ quantity: number } | null>
    findCartItemWithQuantityById(cartItemId: string, tx: DatabaseTransaction): Promise<{ quantity: number } | null>

    deleteCartItemByWhere(where: SQL, tx: void): Promise<void>
    deleteCartItemByWhere(where: SQL, tx: DatabaseTransaction): Promise<void>
}

@Injectable()
export class CartItemsRepositoryImpl implements CartItemsRepository {

    constructor(
        @InjectDatabase() private readonly database: Database
    ) { }

    async updateCartItemQuantityById(cartItemId: string, quantity: number, tx: DatabaseTransaction | void): Promise<number> {
        return await (tx || this.database)
            .update(cartItemsTable)
            .set({ quantity })
            .where(eq(cartItemsTable.id, cartItemId))
            .returning({ quantity: cartItemsTable.quantity })
            .then(r => r?.[0]?.quantity)
    }

    async findCartItemWithQuantityById(cartItemId: string, tx: DatabaseTransaction | void): Promise<{ quantity: number } | null> {
        const cartItem = await (tx || this.database).query.cartItemsTable.findFirst({
            where: eq(cartItemsTable.id, cartItemId),
            columns: { quantity: true }
        })

        if (!cartItem) {
            return null
        }

        return cartItem
    }

    async deleteCartItemByWhere(where: SQL, tx: DatabaseTransaction | void): Promise<void> {
        await this.database.delete(cartItemsTable).where(where);
    }
}

export const CartItemsRepositoryToken = Symbol("CartItemsRepository")

export const InjectCartItemsRepository = () => Inject(CartItemsRepositoryToken)

export const CartItemsRepositoryProvider: Provider = {
    provide: CartItemsRepositoryToken,
    useClass: CartItemsRepositoryImpl
}
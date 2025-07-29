import { Database, InjectDatabase } from "@/shared/infrastructure/database/database.module";
import { DatabaseTransaction } from "@/shared/infrastructure/database/providers/transaction-manager.provider";
import { cartsTable } from "@/shared/infrastructure/database/schema/commerce/carts.table";
import { Inject, Injectable, Provider } from "@nestjs/common";
import { eq, SQL } from "drizzle-orm";

export interface CartsRepository {
    getCartIdByUserId(userId: string, tx: void): Promise<string>
    getCartIdByUserId(userId: string, tx: DatabaseTransaction): Promise<string>

    create(userId: string, tx: void): Promise<{ id: string; }>
    create(userId: string, tx: DatabaseTransaction): Promise<{ id: string; }>
}

@Injectable()
export class CartsRepositoryImpl implements CartsRepository {

    constructor(
        @InjectDatabase() private readonly database: Database
    ) { }

    async getCartIdByUserId(userId: string, tx: DatabaseTransaction | void) {
        let cartId = await (tx || this.database).query.cartsTable
            .findFirst({
                where: eq(cartsTable.userId, userId),
                columns: {
                    id: true
                }
            })
            .then(r => r?.id)

        if (!cartId) {
            const cart = await this.create(userId)
            cartId = cart.id
        }

        return cartId;
    }

    async create(userId: string, tx: DatabaseTransaction | void) {
        const cart = await (tx || this.database)
            .insert(cartsTable)
            .values({ userId })
            .returning({ id: cartsTable.id })
            .then(r => r?.[0])
        return cart
    }
}

export const CartsRepositoryToken = Symbol("CartsRepository")

export const InjectCartsRepository = () => Inject(CartsRepositoryToken)

export const CartsRepositoryProvider: Provider = {
    provide: CartsRepositoryToken,
    useClass: CartsRepositoryImpl
}
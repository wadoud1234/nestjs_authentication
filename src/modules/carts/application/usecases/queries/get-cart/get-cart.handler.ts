import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetCartQuery } from "./get-cart.query";
import { GetCartQueryResult } from "./get-cart.result";
import { Database, InjectDatabase } from "@/shared/infrastructure/database/database.module";
import { asc, ilike, or, SQL, inArray, and, between, gte, desc, ne, eq, count } from "drizzle-orm";
import { ConflictException, Provider } from "@nestjs/common";
import { cartsTable } from "@/shared/infrastructure/database/schema/commerce/carts.table";
import { authorColumns } from "@/modules/users/infrastructure/repositories/helpers/columns/author.columns";
import { bookDetailsWithoutTimestampsColumns } from "@/modules/books/infrastructure/repositories/helpers/columns/book-details-without-timestamps.columns";
import { cartItemsTable } from "@/shared/infrastructure/database/schema/commerce/cart-items.table";
import { cartItemsColumns } from "@/modules/carts/infrastructure/repositories/helpers/columns/cart-items.columns";
import { cartsColumns } from "@/modules/carts/infrastructure/repositories/helpers/columns/carts.columns";
import { CartsRepository, InjectCartsRepository } from "@/modules/carts/infrastructure/repositories/carts.repository";
import { CartItemsRepository, InjectCartItemsRepository } from "@/modules/carts/infrastructure/repositories/cart-items.repository";

export interface GetCartQueryHandler extends IQueryHandler<GetCartQuery> { }

@QueryHandler(GetCartQuery)
export class GetCartQueryHandlerImpl implements GetCartQueryHandler {
    constructor(
        @InjectDatabase() private readonly database: Database,
        @InjectCartsRepository() private readonly cartsRepository: CartsRepository,
        @InjectCartItemsRepository() private readonly cartItemsRepository: CartItemsRepository
    ) { }

    async execute({ currentUserId }: GetCartQuery): Promise<GetCartQueryResult> {

        const cartId = await this.cartsRepository.getCartIdByUserId(currentUserId);

        const whereCondition = eq(cartItemsTable.cartId, cartId);

        const cartItems = await this.database.query.cartItemsTable.findMany({
            where: whereCondition,
            columns: cartItemsColumns(),
            with: {
                book: {
                    columns: bookDetailsWithoutTimestampsColumns(),
                    with: {
                        author: {
                            columns: authorColumns()
                        }
                    }
                }
            }
        })

        return {
            id: cartId,
            items: cartItems
        }
    }
}

export const GetCartQueryHandlerToken = Symbol("GetCartQueryHandler")

export const GetCartQueryHandlerProvider: Provider = {
    provide: GetCartQueryHandlerToken,
    useClass: GetCartQueryHandlerImpl
}
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetCartItemsCountQueryResult } from "./get-cart-items-count.result";
import { Database, InjectDatabase } from "@/shared/infrastructure/database/database.module";
import { asc, ilike, or, SQL, inArray, and, between, gte, desc, ne, eq, count } from "drizzle-orm";
import { ConflictException, Provider } from "@nestjs/common";
import { cartsTable } from "@/shared/infrastructure/database/schema/commerce/carts.table";
import { authorColumns } from "@/modules/users/infrastructure/repositories/helpers/columns/author.columns";
import { bookDetailsWithoutTimestampsColumns } from "@/modules/books/infrastructure/repositories/helpers/columns/book-details-without-timestamps.columns";
import { cartItemsTable } from "@/shared/infrastructure/database/schema/commerce/cart-items.table";
import { cartItemsColumns } from "@/modules/carts/infrastructure/repositories/helpers/columns/cart-items.columns";
import { GetCartItemsCountQuery } from "./get-cart-items-count.query";
import { CartsRepository, InjectCartsRepository } from "@/modules/carts/infrastructure/repositories/carts.repository";

export interface GetCartItemsCountQueryHandler extends IQueryHandler<GetCartItemsCountQuery> { }

@QueryHandler(GetCartItemsCountQuery)
export class GetCartItemsCountQueryHandlerImpl implements GetCartItemsCountQueryHandler {
    constructor(
        @InjectDatabase() private readonly database: Database,
        @InjectCartsRepository() private readonly cartsRepository: CartsRepository
    ) { }

    async execute({ currentUserId }: GetCartItemsCountQuery): Promise<GetCartItemsCountQueryResult> {
        let cartId = await this.cartsRepository.getCartIdByUserId(currentUserId)

        const whereCondition = eq(cartItemsTable.cartId, cartId);

        const [{ count: itemsCount }] = await this.database
            .select({ count: count() })
            .from(cartItemsTable)
            .where(whereCondition);

        return {
            count: itemsCount
        }
    }
}

export const GetCartItemsCountQueryHandlerToken = Symbol("GetCartItemsCountQueryHandler")

export const GetCartItemsCountQueryHandlerProvider: Provider = {
    provide: GetCartItemsCountQueryHandlerToken,
    useClass: GetCartItemsCountQueryHandlerImpl
}
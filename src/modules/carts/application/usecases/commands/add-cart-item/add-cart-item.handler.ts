import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { InjectPasswordHasher, PasswordHasher } from "@/modules/auth/application/services/password-hasher.service";
import { AddCartItemCommand } from "./add-cart-item.command";
import { AddCartItemCommandResult } from "./add-cart-item.result";
import { ConflictException, Provider } from "@nestjs/common";
import { InjectUsersRepository, UsersRepository } from "@/modules/users/infrastructure/repositories/users.repository";
import { CartsRepository, InjectCartsRepository } from "@/modules/carts/infrastructure/repositories/carts.repository";
import { CartItemsRepository, InjectCartItemsRepository } from "@/modules/carts/infrastructure/repositories/cart-items.repository";
import { and, eq } from "drizzle-orm";
import { cartsTable } from "@/shared/infrastructure/database/schema/commerce/carts.table";
import { BooksRepository, InjectBooksRepository } from "@/modules/books/infrastructure/repositories/books.repository";
import { booksTable } from "@/shared/infrastructure/database/schema/books/books.table";
import { BookNotFoundException } from "@/modules/books/domain/exceptions/book-not-found.exception";
import { Database, InjectDatabase } from "@/shared/infrastructure/database/database.module";
import { cartItemsTable } from "@/shared/infrastructure/database/schema/commerce/cart-items.table";
import { cartItemsColumns } from "@/modules/carts/infrastructure/repositories/helpers/columns/cart-items.columns";
import { bookDetailsWithoutTimestampsColumns } from "@/modules/books/infrastructure/repositories/helpers/columns/book-details-without-timestamps.columns";
import { authorColumns } from "@/modules/users/infrastructure/repositories/helpers/columns/author.columns";

export interface AddCartItemCommandHandler extends ICommandHandler<AddCartItemCommand> { }

@CommandHandler(AddCartItemCommand)
export class AddCartItemCommandHandlerImpl implements AddCartItemCommandHandler {

    constructor(
        @InjectCartsRepository() private readonly cartsRepository: CartsRepository,
        @InjectCartItemsRepository() private readonly cartItemsRepository: CartItemsRepository,
        @InjectDatabase() private readonly database: Database
    ) { }

    async execute({ bookId, quantity, currentUserId }: AddCartItemCommand): Promise<AddCartItemCommandResult> {

        const cartItem = await this.database.transaction(async (tx) => {
            const cartId = await this.cartsRepository.getCartIdByUserId(currentUserId, tx);

            const book = await tx.query.booksTable.findFirst({
                where: eq(booksTable.id, bookId),
                columns: {
                    price: true,
                    id: true
                }
            })

            if (!book || !book.id) {
                throw new BookNotFoundException(`The book with id=${bookId} you want to add to your cart is not found`)
            }

            const existedBookInUserCart = await tx.query.cartItemsTable.findFirst({
                where: and(eq(cartItemsTable.bookId, bookId), eq(cartItemsTable.cartId, cartId)),
                columns: {
                    id: true,
                    quantity: true
                }
            })

            let cartItemId: string;

            if (existedBookInUserCart && existedBookInUserCart.id) {
                // if book exist in cart update quantity with sum of old quantity + new quantity

                cartItemId = await tx
                    .update(cartItemsTable)
                    .set({
                        quantity: existedBookInUserCart.quantity + quantity,
                        addedAt: new Date()
                    })
                    .where(
                        and(
                            eq(cartItemsTable.bookId, bookId),
                            eq(cartItemsTable.cartId, cartId)
                        )
                    )
                    .returning({ id: cartItemsTable.id })
                    .then(r => r?.[0]?.id)
            }
            else {
                // else create new cart item with quantity and current book price
                cartItemId = await tx
                    .insert(cartItemsTable)
                    .values({
                        bookId,
                        cartId,
                        priceAtAdd: book.price,
                        quantity,
                    })
                    .returning({ id: cartItemsTable.id })
                    .then(r => r?.[0]?.id)
            }

            const cartItem = await tx.query.cartItemsTable.findFirst({
                where: eq(cartItemsTable.id, cartItemId),
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

            if (!cartItem) {
                throw new ConflictException("I am sure that a cart item was created i swear hahaha")
            }

            return cartItem
        })

        return cartItem
    }

}

export const AddCartItemCommandHandlerToken = Symbol("AddCartItemCommandHandler");

export const AddCartItemCommandHandlerProvider: Provider = {
    provide: AddCartItemCommandHandlerToken,
    useClass: AddCartItemCommandHandlerImpl
} 
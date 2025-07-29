import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { InjectPasswordHasher, PasswordHasher } from "@/modules/auth/application/services/password-hasher.service";
import { InvalidCredentialsException } from "@/modules/auth/domain/exceptions/invalid-credentials.exception";
import { ToggleWishlistBookCommand } from "./toggle-wishlist.command";
import { ToggleWishlistBookCommandResult } from "./toggle-wishlist.result";
import { Provider } from "@nestjs/common";
import { AuthJwtPayload } from "@/modules/auth/_sub-modules/jwts/domain/types/auth-jwt-payload.types";
import { Database, InjectDatabase } from "@/shared/infrastructure/database/database.module";
import { usersTable } from "@/shared/infrastructure/database/schema/identity/users.table";
import { and, eq } from "drizzle-orm";
import { booksTable } from "@/shared/infrastructure/database/schema/books/books.table";
import { BookNotFoundException } from "@/modules/books/domain/exceptions/book-not-found.exception";
import { wishlistItemsTable } from "@/shared/infrastructure/database/schema/user-engagement/wishlist-items.table";
import { DatabaseTransaction } from "@/shared/infrastructure/database/providers/transaction-manager.provider";
import { InjectWishlistsRepository, WishlistsRepository } from "../../../../infrastructure/repositories/wishlists.repository";

export interface ToggleWishlistCommandHandler extends ICommandHandler<ToggleWishlistBookCommand> { }

@CommandHandler(ToggleWishlistBookCommand)
export class ToggleWishlistBookCommandHandlerImpl implements ToggleWishlistCommandHandler {

    constructor(
        @InjectDatabase() private readonly database: Database,
        @InjectWishlistsRepository() private readonly wishlistsService: WishlistsRepository
    ) { }

    async execute({ bookId, userId }: ToggleWishlistBookCommand): Promise<ToggleWishlistBookCommandResult> {
        const result = await this.database.transaction(async (tx) => {
            const book = await this.database.query.booksTable.findFirst({
                where: eq(booksTable.id, bookId)
            })
            if (!book) throw new BookNotFoundException();

            const whereCondition = and(eq(wishlistItemsTable.bookId, bookId), eq(wishlistItemsTable.userId, userId))

            const wishlistItem = await this.wishlistsService.getWishlistItemIdByWhere(whereCondition, tx)

            if (!wishlistItem || !wishlistItem.id) {
                // Not WISHLISTED
                await this.wishlistsService.addToWishlist(bookId, userId, tx);
                return { wishlisted: true }
            }

            await this.wishlistsService.removeFromWishlist(wishlistItem.id, tx)
            return { wishlisted: false }

        })

        return result;
    }

}

export const ToggleWishlistBookCommandHandlerToken = Symbol("ToggleWishlistBookCommandHandler");

export const ToggleWishlistBookCommandHandlerProvider: Provider = {
    provide: ToggleWishlistBookCommandHandlerToken,
    useClass: ToggleWishlistBookCommandHandlerImpl
} 
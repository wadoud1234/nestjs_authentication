import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { Provider } from "@nestjs/common";
import { AuthJwtPayload } from "@/modules/auth/_sub-modules/jwts/domain/types/auth-jwt-payload.types";
import { Database, InjectDatabase } from "@/shared/infrastructure/database/database.module";
import { usersTable } from "@/shared/infrastructure/database/schema/identity/users.table";
import { InjectWishlistsRepository, WishlistsRepository } from "../../../../infrastructure/repositories/wishlists.repository";
import { DeleteWishlistCommand } from "./delete-wishlist.command";
import { DeleteWishlistCommandResult } from "./delete-wishlist.result";

export interface DeleteWishlistCommandHandler extends ICommandHandler<DeleteWishlistCommand> { }

@CommandHandler(DeleteWishlistCommand)
export class DeleteWishlistCommandHandlerImpl implements DeleteWishlistCommandHandler {

    constructor(
        @InjectDatabase() private readonly database: Database,
        @InjectWishlistsRepository() private readonly wishlistsService: WishlistsRepository
    ) { }

    async execute({ id }: DeleteWishlistCommand): Promise<DeleteWishlistCommandResult> {
        await this.wishlistsService.removeFromWishlist(id)
        return {}
    }

}

export const DeleteWishlistCommandHandlerToken = Symbol("DeleteWishlistCommandHandler");

export const DeleteWishlistCommandHandlerProvider: Provider = {
    provide: DeleteWishlistCommandHandlerToken,
    useClass: DeleteWishlistCommandHandlerImpl
} 
import { Command } from "@nestjs/cqrs";
import { ClearCartCommandResult } from "./clear-cart.result";
import { UserEntity } from "@/modules/users/domain/entities/user.entity";

export class ClearCartCommand extends Command<ClearCartCommandResult> {

    constructor(public readonly currentUserId: string) {
        super();
    }

    static from(currentUser: UserEntity): ClearCartCommand {

        return new ClearCartCommand(
            currentUser.id,
        );

    }
}
import { Injectable } from "@nestjs/common";
import { Action, AppAbility, Subjects } from "../../domain/types";
import { UsersTable } from "@/shared/infrastructure/database/schema/users.table";
import { AbilityBuilder, createMongoAbility, ExtractSubjectType } from '@casl/ability';
import { UserRole } from "@/modules/users/domain/enums/user-role.enum";
import { UserEntity } from "@/modules/users/domain/entities/user.entity";
import { BookEntity } from "@/modules/books/domain/entities/book.entity";
import { UserResponsePayload } from "@/modules/users/presentation/contracts/responses/user.response";

export interface AuthAbilityFactory {
    createForUser(user: UserResponsePayload): AppAbility
    createForUser(user: UsersTable): AppAbility
}

@Injectable()
export class CaslAbilityFactory implements AuthAbilityFactory {
    createForUser(user: UserResponsePayload): AppAbility
    createForUser(user: UsersTable): AppAbility {
        const { can, cannot, build } = new AbilityBuilder<AppAbility>(createMongoAbility);
        switch (user.role) {
            case UserRole.ADMIN:
                can(Action.Manage, 'all');
                break;
            case UserRole.AUTHOR:
                // ====> USERS    

                // Author can read any users 
                can(Action.Read, UserEntity)
                // Author can update their own profile
                can(Action.Update, UserEntity, { id: user.id });

                // ====> BOOKS

                // Author can read any books
                can(Action.Read, BookEntity)

                // Author can create its book
                can(Action.Create, BookEntity)

                // Author can update or delete its own books
                can(Action.Update, BookEntity, { authorId: user.id })
                can(Action.Delete, BookEntity, { authorId: user.id })

                break;
            case UserRole.USER:
                // ====> USERS    

                // Author can read any users 
                can(Action.Read, UserEntity)

                // Author can update their own profile
                can(Action.Update, UserEntity, { id: user.id });

                // ====> BOOKS

                // Author can read any books
                can(Action.Read, BookEntity, { isPublished: true })
                break;
        }

        return build({
            // Read https://casl.js.org/v6/en/guide/subject-type-detection#use-classes-as-subject-types for details
            detectSubjectType: (item) =>
                item.constructor as ExtractSubjectType<Subjects>,
        });
    }
}
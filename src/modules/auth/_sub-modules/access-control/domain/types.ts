import { BookEntity } from "@/modules/books/domain/entities/book.entity";
import { UserEntity } from "@/modules/users/domain/entities/user.entity";
import { BooksTable } from "@/shared/infrastructure/database/schema/books.table";
import { UsersTable } from "@/shared/infrastructure/database/schema/users.table";
import { InferSubjects, MongoAbility } from '@casl/ability';

export enum Action {
    Manage = 'manage',
    Create = 'create',
    Read = 'read',
    Update = 'update',
    Delete = 'delete',
}

export type Subjects = InferSubjects<typeof UserEntity | typeof BookEntity> | 'all';

// Define the Ability type
export type AppAbility = MongoAbility<[Action, Subjects]>;
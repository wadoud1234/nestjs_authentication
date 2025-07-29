// books/book.policy.ts
import { Inject, Injectable, Provider } from '@nestjs/common';
import { BookEntity } from '../../domain/entities/book.entity';

export interface BooksPolicyService {
    canCreate(user: { permissions: string[]; }): boolean

    canEdit(user: { id: string; permissions: string[]; }, book: BookEntity): boolean

    canDelete(user: { id: string; permissions: string[]; }, book: { authorId: string }): boolean

    canView(user: { permissions: string[]; }, book: BookEntity): boolean

    canPublish(user: { permissions: string[]; }): boolean
}

@Injectable()
export class BooksPolicyServiceImpl implements BooksPolicyService {
    /**
     * Can the user create a book?
     */
    canCreate(user: { permissions: string[] }): boolean {
        return user.permissions.includes('book:create');
    }

    /**
     * Can the user edit this specific book?
     */
    canEdit(user: { id: string; permissions: string[] }, book: BookEntity): boolean {
        // Admins or editors can edit any book
        if (user.permissions.includes('book:edit:any')) return true;

        // Authors can edit own books
        if (
            user.permissions.includes('book:edit:own') &&
            book.authorId === user.id
        ) {
            return true;
        }

        return false;
    }

    /**
     * Can the user delete this book?
     */
    canDelete(user: { id: string; permissions: string[] }, book: { authorId: string }): boolean {
        if (user.permissions.includes('book:delete:any')) return true;

        if (
            user.permissions.includes('book:delete:own') &&
            book.authorId === user.id
        ) {
            return true;
        }

        return false;
    }

    /**
     * Can the user view this book?
     */
    canView(user: { permissions: string[] }, book: BookEntity): boolean {
        // Drafts require special permission
        if (!book.isPublished) {
            return user.permissions.includes('book:view:draft');
        }
        return true; // Published books are public
    }

    /**
     * Can the user publish/unpublish?
     */
    canPublish(user: { permissions: string[] }): boolean {
        return user.permissions.includes('book:publish');
    }
}

export const BooksPolicyServiceToken = Symbol("BooksPolicyService")

export const InjectBooksPolicy = () => Inject(BooksPolicyServiceToken)

export const BookPolicyServiceProvider: Provider = {
    provide: BooksPolicyServiceToken,
    useClass: BooksPolicyServiceImpl
}
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateBookCommand } from "./create-book.command";
import { CreateBookResult } from "./create-book.result";
import { ConflictException, Provider, UnauthorizedException } from "@nestjs/common";
import { Database, InjectDatabase } from "@/shared/infrastructure/database/database.module";
import { booksTable } from "@/shared/infrastructure/database/schema/books/books.table";
import { InjectSlugGenerator, SlugGeneratorService } from "../../../services/slug-generator.service";
import { eq } from "drizzle-orm";
import { categoriesTable } from "@/shared/infrastructure/database/schema/books/categories.table";
import { CategoryNotFoundException } from "@/modules/categories/domain/exceptions/category-not-found.exception";
import { BooksPolicyService, InjectBooksPolicy } from "../../../services/books-policy.service";
import { BooksRepository, InjectBooksRepository } from "@/modules/books/infrastructure/repositories/books.repository";
import { YouDontHaveSufficientPermissionsExcpetion } from "@/modules/auth/_sub-modules/access-control/domain/exceptions/insufficient-permissions.exception";
import { CategoriesRepository, InjectCategoriesRepository } from "@/modules/categories/infrastructure/repositories/categories.repository";

export interface CreateBookCommandHandler extends ICommandHandler<CreateBookCommand> { }

@CommandHandler(CreateBookCommand)
export class CreateBookCommandHandlerImpl implements CreateBookCommandHandler {
    constructor(
        @InjectDatabase() private readonly database: Database,
        @InjectSlugGenerator() private readonly slugGenerator: SlugGeneratorService,
        @InjectBooksPolicy() private readonly booksPolicy: BooksPolicyService,
        @InjectBooksRepository() private readonly booksRepository: BooksRepository,
        @InjectCategoriesRepository() private readonly categoriesRepository: CategoriesRepository
    ) { }

    async execute({ title, description, pages, price, stock, isbn, currentUser, categoryIds }: CreateBookCommand): Promise<CreateBookResult> {
        const book = await this.database.transaction(async (tx) => {
            // Verify that book doesnt exist with same title
            const isBookExist = await this.booksRepository.isBookExistByWhere(eq(booksTable.title, title), tx)

            if (isBookExist) {
                throw new ConflictException("Book title already used, try to change it !")
            }

            // AUTHORIZE USER
            if (!this.booksPolicy.canCreate(currentUser)) {
                throw new YouDontHaveSufficientPermissionsExcpetion("You dont have permission to create new book !")
            }

            let generatedSlug = this.slugGenerator.generate(title);

            // Verify that slug wasnot used before
            const isSlugUsedBefore = await this.booksRepository.isBookSlugUsed(generatedSlug, tx)

            if (isSlugUsedBefore) {
                generatedSlug = generatedSlug + new Date().toISOString()
            }

            if (!Array.isArray(categoryIds) || categoryIds.length <= 0) {
                throw new ConflictException("Category IDs must not be empty")
            }

            const categories = await Promise.all(
                categoryIds.map(async (categoryId) => {
                    const category = await this.categoriesRepository.isCategoryExistByWhere(eq(categoriesTable.id, categoryId), tx)
                    if (!category) throw new CategoryNotFoundException(`Category with id=${categoryId} not found`);
                    return categoryId;
                })
            )

            const { id: newBookId } = await this.booksRepository.create({
                title,
                slug: generatedSlug,
                authorId: currentUser.id,
                description,
                price,
                pages,
                stock,
                isbn
            }, tx)


            await this.booksRepository.saveNewBookCategoryRelations(newBookId, categories, tx)

            const book = await this.booksRepository.findBookByWhereWithAuthorAndCategories(eq(booksTable.id, newBookId), tx)

            if (!book) throw new ConflictException("I am sure there is a problem because generated book not found")

            return book
        })

        return book
    }
}

export const CreateBookCommandHandlerToken = Symbol("CreateBookCommandHandler")

export const CreateBookCommandHandlerProvider: Provider = {
    provide: CreateBookCommandHandlerToken,
    useClass: CreateBookCommandHandlerImpl
}
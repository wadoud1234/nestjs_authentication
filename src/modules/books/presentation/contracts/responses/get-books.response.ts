import { PaginatedResponsePayload } from "@/shared/presentation/contracts/responses/paginated.response";
import { BookWithAuthorAndCategoryAndOptionalWishlistResponsePayload } from "./book-with-author-and-category.response";

export class GetBooksResponsePayload extends PaginatedResponsePayload<BookWithAuthorAndCategoryAndOptionalWishlistResponsePayload> { }
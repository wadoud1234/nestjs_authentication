import { BookEntity } from "@/modules/books/domain/entities/book.entity";
import { GetBooksResponsePayload } from "@/modules/books/presentation/contracts/responses/get-books.response";
import { PaginatedResponsePayload } from "@/shared/presentation/contracts/responses/paginated.response";

export class GetBooksQueryResult extends GetBooksResponsePayload { }
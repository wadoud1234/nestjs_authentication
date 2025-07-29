import { AuthorDetails } from "@/modules/users/presentation/contracts/responses/author.response";

export class BookDetails {
    constructor(
        public readonly id: string,
        public readonly title: string,
        public readonly slug: string,
        public readonly description: string,
        public readonly price: string,
        public readonly stock: number,
        public readonly pages: number,
        public readonly rating: string,
        public readonly ratingsCount: number,
        public readonly isbn: string,
        public readonly isPublished: boolean,
        public readonly author: AuthorDetails,
    ) { }
}
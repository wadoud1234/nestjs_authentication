export class PaginatedResponsePayload<T> {
    values: T[]
    numberOfValues: number
    numberOfPages: number
    page: number
    size: number
}
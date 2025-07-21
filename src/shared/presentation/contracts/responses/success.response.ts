export class SuccessResponsePayload<T> {
    constructor(
        public readonly data: T,
        public readonly message: string
    ) { }
}

export class SuccessResponse<T> extends SuccessResponsePayload<T> {
    public readonly success: true;

    constructor(data: T)
    constructor(data: T, message?: string) {
        super(data, message ?? "Success")
        this.success = true;
    }
}
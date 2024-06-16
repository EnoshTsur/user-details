export interface ResponseDto <T> {
    readonly value: T | undefined
    readonly message?: string
    readonly error?: Error
}
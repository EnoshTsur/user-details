export interface Dto<T> {
    readonly body: T | ReadonlyArray<T> | null
    readonly statusCode: 200 | 400 | 401 | 403 | 404 | 500
    readonly error: string | null
    readonly actionCode: string
}
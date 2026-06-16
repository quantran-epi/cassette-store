export type TrelloOperationName =
    "create-card"
    | "update-card"
    | "move-card"
    | "create-comment"
    | "create-attachment"
    | "delete-attachment"
    | "get-attachments";

export type TrelloOperationSuccess<T> = {
    ok: true;
    operation: TrelloOperationName;
    data: T;
    retryPayload?: unknown;
}

export type TrelloOperationFailure = {
    ok: false;
    operation: TrelloOperationName;
    retryable: boolean;
    message: string;
    status?: number;
    cause?: unknown;
    retryPayload?: unknown;
}

export type TrelloOperationResult<T> = TrelloOperationSuccess<T> | TrelloOperationFailure;

export const createTrelloOperationSuccess = <T>(operation: TrelloOperationName, data: T, retryPayload?: unknown): TrelloOperationSuccess<T> => {
    const result: TrelloOperationSuccess<T> = {
        ok: true,
        operation,
        data
    };
    if (retryPayload !== undefined) result.retryPayload = retryPayload;
    return result;
};

export const createTrelloOperationFailure = (failure: Omit<TrelloOperationFailure, "ok">): TrelloOperationFailure => ({
    ok: false,
    ...failure
});

export const isTrelloOperationFailure = <T>(result: TrelloOperationResult<T>): result is TrelloOperationFailure => {
    return result.ok === false;
}

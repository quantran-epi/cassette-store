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

export const createTrelloOperationSuccess = <T>(operation: TrelloOperationName, data: T): TrelloOperationSuccess<T> => ({
    ok: true,
    operation,
    data
});

export const createTrelloOperationFailure = (failure: Omit<TrelloOperationFailure, "ok">): TrelloOperationFailure => ({
    ok: false,
    ...failure
});

export const isTrelloOperationFailure = <T>(result: TrelloOperationResult<T>): result is TrelloOperationFailure => {
    return result.ok === false;
}

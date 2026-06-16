import type {TrelloOperationName} from "@hooks/Trello/TrelloOperationResult";

export type OrderSyncFailureStatus = "failed" | "retrying";

export type OrderSyncFailureOperation = TrelloOperationName;

export type OrderSyncFailure = {
    id: string;
    orderId: string;
    operation: OrderSyncFailureOperation;
    status: OrderSyncFailureStatus;
    message: string;
    retryable: boolean;
    createdAt: string;
    updatedAt: string;
    trelloCardId?: string;
    retryPayload?: unknown;
}

import type {OrderSyncFailure} from "@store/Models/OrderSyncFailure";

export type OrderWorkflowOperation =
    "create-order"
    | "update-order"
    | "change-shipping-code"
    | "mark-shipped"
    | "mark-returned"
    | "mark-waiting-for-return"
    | "mark-refuse-to-receive"
    | "mark-broken-items"
    | "pay-cod"
    | "refund"
    | "attach-images"
    | "retry-sync";

export type OrderWorkflowResult<T> = {
    ok: boolean;
    operation: OrderWorkflowOperation;
    localUpdated: boolean;
    data?: T;
    syncFailures: OrderSyncFailure[];
    message: string;
    error?: unknown;
}

export const createOrderWorkflowSuccess = <T>(props: {
    operation: OrderWorkflowOperation;
    data?: T;
    syncFailures?: OrderSyncFailure[];
    message?: string;
}): OrderWorkflowResult<T> => ({
    ok: true,
    operation: props.operation,
    localUpdated: true,
    data: props.data,
    syncFailures: props.syncFailures || [],
    message: props.message || "Đã lưu thay đổi"
});

export const createOrderWorkflowFailure = <T>(props: {
    operation: OrderWorkflowOperation;
    message: string;
    error?: unknown;
}): OrderWorkflowResult<T> => ({
    ok: false,
    operation: props.operation,
    localUpdated: false,
    syncFailures: [],
    message: props.message,
    error: props.error
});

export const hasOrderWorkflowSyncFailures = <T>(result: OrderWorkflowResult<T>): boolean => {
    return result.localUpdated && result.syncFailures.length > 0;
}

export const getOrderWorkflowMessage = <T>(result: OrderWorkflowResult<T>): string => {
    if (!result.localUpdated) return result.message || "Không thể lưu thay đổi";
    if (hasOrderWorkflowSyncFailures(result)) return `${result.message}. Cần đồng bộ lại Trello.`;
    return result.message;
}

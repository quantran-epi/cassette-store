import {Order} from "@store/Models/Order";
import {Customer} from "@store/Models/Customer";
import {
    ORDER_TRELLO_LABEL_KEYS,
    OrderDomainHelper,
    OrderTrelloLabelKey
} from "@common/Helpers/OrderDomainHelper";
import type {UseTrello} from "./useTrello";
import {TrelloCard} from "./Models/TrelloCard";
import {TrelloAction} from "./Models/TrelloAction";
import {TrelloAttachment} from "./Models/TrelloAttachment";
import {TrelloCreateAttachmentParam} from "./Models/ApiParam";
import {
    createTrelloOperationFailure,
    createTrelloOperationSuccess,
    TrelloOperationName,
    TrelloOperationResult
} from "./TrelloOperationResult";

export type OrderTrelloAdapter = {
    createOrderCard: (order: Order, customer: Customer, idList?: string) => Promise<TrelloOperationResult<TrelloCard>>;
    updateOrderCard: (order: Order, customer: Customer) => Promise<TrelloOperationResult<TrelloCard>>;
    moveOrderCard: (trelloCardId: string, idList: string, orderId?: string) => Promise<TrelloOperationResult<TrelloCard>>;
    createShippingCodeComment: (trelloCardId: string, shippingCode: string, orderId?: string) => Promise<TrelloOperationResult<TrelloAction>>;
    createOrderAttachment: (order: Order, params: TrelloCreateAttachmentParam) => Promise<TrelloOperationResult<TrelloAttachment>>;
    deleteOrderAttachment: (trelloCardId: string, idAttachment: string, orderId?: string) => Promise<TrelloOperationResult<void>>;
    getOrderAttachments: (trelloCardId: string, orderId?: string) => Promise<TrelloOperationResult<TrelloAttachment[]>>;
}

const _statusFromCause = (cause: unknown): number => {
    if (cause && typeof cause === "object" && "status" in cause && typeof cause["status"] === "number") return cause["status"];
    return undefined;
}

const _messageFromCause = (cause: unknown, fallback: string): string => {
    if (cause && typeof cause === "object" && "body" in cause) {
        const body = cause["body"];
        if (body && typeof body === "object" && "message" in body && typeof body["message"] === "string") return body["message"];
        if (typeof body === "string") return body;
    }
    if (cause instanceof Error && cause.message) return cause.message;
    return fallback;
}

const _failure = (
    operation: TrelloOperationName,
    cause: unknown,
    retryPayload: unknown,
    fallbackMessage: string,
    retryable: boolean = true
) => createTrelloOperationFailure({
    operation,
    retryable,
    message: _messageFromCause(cause, fallbackMessage),
    status: _statusFromCause(cause),
    cause,
    retryPayload
});

const _missingLocalValueFailure = (operation: TrelloOperationName, message: string, retryPayload: unknown) => createTrelloOperationFailure({
    operation,
    retryable: false,
    message,
    retryPayload
});

const _emptyTrelloResponseFailure = (operation: TrelloOperationName, retryPayload: unknown) => createTrelloOperationFailure({
    operation,
    retryable: true,
    message: "Trello returned an empty response",
    retryPayload
});

export const createOrderTrelloAdapter = (trello: UseTrello): OrderTrelloAdapter => {
    const _getLabelId = (key: OrderTrelloLabelKey): string => {
        switch (key) {
            case ORDER_TRELLO_LABEL_KEYS.VIP:
                return trello.TRELLO_LIST_LABEL_IDS.VIP;
            case ORDER_TRELLO_LABEL_KEYS.URGENT:
                return trello.TRELLO_LIST_LABEL_IDS.URGENT;
            case ORDER_TRELLO_LABEL_KEYS.PRIORITY:
                return trello.TRELLO_LIST_LABEL_IDS.PRIORITY;
            case ORDER_TRELLO_LABEL_KEYS.BANK_TRANSFER_IN_ADVANCE:
                return trello.TRELLO_LIST_LABEL_IDS.BANK_TRANSFER_IN_ADVANCE;
            case ORDER_TRELLO_LABEL_KEYS.CUSTOMER_RETURN_LESS_THAN_4:
                return trello.TRELLO_LIST_LABEL_IDS.CUSTOMER_RETURN_LESS_THAN_4;
        }
    }

    const _getLabelIds = (order: Order, customer: Customer): string[] => {
        return OrderDomainHelper.getOrderTrelloLabelKeys(order, customer)
            .map(_getLabelId)
            .filter(Boolean);
    }

    const createOrderCard = async (order: Order, customer: Customer, idList: string = trello.TRELLO_LIST_IDS.TODO_LIST): Promise<TrelloOperationResult<TrelloCard>> => {
        const retryPayload = {orderId: order.id, customerId: customer.id, idList};
        try {
            const card = await trello.createCard({
                name: order.name,
                desc: OrderDomainHelper.buildOrderTrelloDescription(order, customer),
                start: new Date(),
                pos: order.position,
                idLabels: _getLabelIds(order, customer),
                idList
            });
            if (!card) return _emptyTrelloResponseFailure("create-card", retryPayload);
            return createTrelloOperationSuccess("create-card", card, retryPayload);
        } catch (e) {
            return _failure("create-card", e, retryPayload, "Could not create Trello card");
        }
    }

    const updateOrderCard = async (order: Order, customer: Customer): Promise<TrelloOperationResult<TrelloCard>> => {
        const retryPayload = {orderId: order.id, customerId: customer.id, trelloCardId: order.trelloCardId};
        if (!order.trelloCardId) return _missingLocalValueFailure("update-card", "Missing Trello card ID", retryPayload);
        try {
            const card = await trello.updateCard({
                id: order.trelloCardId,
                desc: OrderDomainHelper.buildOrderTrelloDescription(order, customer),
                pos: order.position,
                idLabels: _getLabelIds(order, customer)
            });
            if (!card) return _emptyTrelloResponseFailure("update-card", retryPayload);
            return createTrelloOperationSuccess("update-card", card, retryPayload);
        } catch (e) {
            return _failure("update-card", e, retryPayload, "Could not update Trello card");
        }
    }

    const moveOrderCard = async (trelloCardId: string, idList: string, orderId?: string): Promise<TrelloOperationResult<TrelloCard>> => {
        const retryPayload = {orderId, trelloCardId, idList};
        if (!trelloCardId) return _missingLocalValueFailure("move-card", "Missing Trello card ID", retryPayload);
        try {
            const card = await trello.updateCard({id: trelloCardId, idList});
            if (!card) return _emptyTrelloResponseFailure("move-card", retryPayload);
            return createTrelloOperationSuccess("move-card", card, retryPayload);
        } catch (e) {
            return _failure("move-card", e, retryPayload, "Could not move Trello card");
        }
    }

    const createShippingCodeComment = async (trelloCardId: string, shippingCode: string, orderId?: string): Promise<TrelloOperationResult<TrelloAction>> => {
        const retryPayload = {orderId, trelloCardId, shippingCode};
        if (!trelloCardId) return _missingLocalValueFailure("create-comment", "Missing Trello card ID", retryPayload);
        try {
            const action = await trello.createComment({text: shippingCode}, trelloCardId);
            if (!action) return _emptyTrelloResponseFailure("create-comment", retryPayload);
            return createTrelloOperationSuccess("create-comment", action, retryPayload);
        } catch (e) {
            return _failure("create-comment", e, retryPayload, "Could not create Trello comment");
        }
    }

    const createOrderAttachment = async (order: Order, params: TrelloCreateAttachmentParam): Promise<TrelloOperationResult<TrelloAttachment>> => {
        const retryPayload = {
            orderId: order.id,
            trelloCardId: order.trelloCardId,
            attachment: {
                name: params.name,
                mimeType: params.mimeType,
                retryKey: params.retryKey
            },
            requiresFileReselect: true
        };
        if (!order.trelloCardId) return _missingLocalValueFailure("create-attachment", "Missing Trello card ID", retryPayload);
        try {
            const attachment = await trello.createAttachment(params, order.trelloCardId);
            if (!attachment) return _emptyTrelloResponseFailure("create-attachment", retryPayload);
            return createTrelloOperationSuccess("create-attachment", attachment, retryPayload);
        } catch (e) {
            return _failure("create-attachment", e, retryPayload, "Could not create Trello attachment");
        }
    }

    const deleteOrderAttachment = async (trelloCardId: string, idAttachment: string, orderId?: string): Promise<TrelloOperationResult<void>> => {
        const retryPayload = {orderId, trelloCardId, idAttachment};
        if (!trelloCardId) return _missingLocalValueFailure("delete-attachment", "Missing Trello card ID", retryPayload);
        if (!idAttachment) return _missingLocalValueFailure("delete-attachment", "Missing Trello attachment ID", retryPayload);
        try {
            await trello.deleteAttachment({idAttachment}, trelloCardId);
            return createTrelloOperationSuccess("delete-attachment", undefined, retryPayload);
        } catch (e) {
            return _failure("delete-attachment", e, retryPayload, "Could not delete Trello attachment");
        }
    }

    const getOrderAttachments = async (trelloCardId: string, orderId?: string): Promise<TrelloOperationResult<TrelloAttachment[]>> => {
        const retryPayload = {orderId, trelloCardId};
        if (!trelloCardId) return _missingLocalValueFailure("get-attachments", "Missing Trello card ID", retryPayload);
        try {
            const attachments = await trello.getAttachmentsOfCard(trelloCardId);
            if (!attachments) return _emptyTrelloResponseFailure("get-attachments", retryPayload);
            return createTrelloOperationSuccess("get-attachments", attachments, retryPayload);
        } catch (e) {
            return _failure("get-attachments", e, retryPayload, "Could not get Trello attachments");
        }
    }

    return {
        createOrderCard,
        updateOrderCard,
        moveOrderCard,
        createShippingCodeComment,
        createOrderAttachment,
        deleteOrderAttachment,
        getOrderAttachments
    }
}

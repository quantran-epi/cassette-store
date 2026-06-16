jest.mock("nanoid", () => ({
    nanoid: () => "test-id"
}));

import {createOrderTrelloAdapter} from "./OrderTrelloAdapter";
import type {UseTrello} from "./useTrello";
import type {Order} from "@store/Models/Order";
import type {Customer} from "@store/Models/Customer";
import {
    CUSTOMER_AREAS,
    CUSTOMER_DIFFUCULTIES,
    ORDER_PAYMENT_METHOD,
    ORDER_PRIORITY_STATUS,
    ORDER_SHIPPING_PARTNER,
    ORDER_STATUS
} from "@common/Constants/AppConstants";

const buildCustomer = (overrides: Partial<Customer> = {}): Customer => ({
    id: "customer-1",
    name: "Nguyen Van A",
    province: "TP. Hồ Chí Minh",
    area: CUSTOMER_AREAS[1],
    address: "12 Test Street",
    mobile: "0909123456",
    buyCount: 3,
    buyAmount: 450000,
    isVIP: true,
    isInBlacklist: false,
    difficulty: CUSTOMER_DIFFUCULTIES[1],
    note: "",
    ...overrides
});

const buildOrder = (overrides: Partial<Order> = {}): Order => ({
    id: "order-1",
    sequence: 1,
    createdDate: "2026-06-15T00:00:00.000Z",
    name: "Order 1",
    placedItems: [
        {id: "item-1", count: 2, type: "SONY-50K", unitPrice: 50000, note: ""}
    ],
    changeItems: [],
    status: ORDER_STATUS.PLACED,
    shippingCost: 25000,
    returnReason: "",
    isRefund: false,
    refundAmount: 0,
    paymentMethod: ORDER_PAYMENT_METHOD.BANK_TRANSFER_IN_ADVANCE,
    paymentAmount: 125000,
    shippingPartner: ORDER_SHIPPING_PARTNER.VNPOST,
    shippingCode: "VN123",
    codAmount: 0,
    priorityMark: 0,
    priorityStatus: ORDER_PRIORITY_STATUS.URGENT,
    dueDate: new Date("2026-06-16T00:00:00.000Z"),
    customerId: "customer-1",
    trelloCardId: "card-1",
    position: 0,
    note: "Giao giờ hành chính",
    isFreeShip: false,
    isPayCOD: false,
    ...overrides
});

const buildCard = (overrides = {}) => ({
    id: "card-1",
    name: "Order 1",
    desc: "",
    dueComplete: false,
    idList: "todo-list",
    start: new Date("2026-06-15T00:00:00.000Z"),
    pos: 0,
    url: "https://trello.example/card-1",
    attachments: [],
    ...overrides
});

const buildTrello = (overrides: Partial<UseTrello> = {}): UseTrello => ({
    TRELLO_LIST_IDS: {
        TODO_LIST: "todo-list",
        DELIVERY_CREATED_LIST: "delivery-list",
        DONE_LIST: "done-list",
        NOT_DELIVERED_LIST: "not-delivered-list"
    },
    TRELLO_LIST_LABEL_IDS: {
        PRIORITY: "priority-label",
        CUSTOMER_RETURN_LESS_THAN_4: "return-less-than-4-label",
        URGENT: "urgent-label",
        BANK_TRANSFER_IN_ADVANCE: "bank-transfer-label",
        VIP: "vip-label"
    },
    getCard: jest.fn(),
    getCardsByList: jest.fn(),
    getAttachmentsOfCard: jest.fn(),
    getAttachment: jest.fn(),
    createCard: jest.fn(),
    updateCard: jest.fn(),
    createAttachment: jest.fn(),
    createComment: jest.fn(),
    deleteAttachment: jest.fn(),
    ...overrides
});

describe("createOrderTrelloAdapter", () => {
    it("wraps the expected order-specific Trello methods", () => {
        const adapter = createOrderTrelloAdapter(buildTrello());

        expect(Object.keys(adapter).sort()).toEqual([
            "createOrderAttachment",
            "createOrderCard",
            "createShippingCodeComment",
            "deleteOrderAttachment",
            "getOrderAttachments",
            "moveOrderCard",
            "updateOrderCard"
        ].sort());
    });

    it("returns ok true with a card when createOrderCard succeeds", async () => {
        const trello = buildTrello({
            createCard: jest.fn().mockResolvedValue(buildCard())
        });
        const adapter = createOrderTrelloAdapter(trello);

        const result = await adapter.createOrderCard(buildOrder(), buildCustomer());

        expect(result).toMatchObject({
            ok: true,
            operation: "create-card",
            data: {id: "card-1"}
        });
        expect(trello.createCard).toHaveBeenCalledWith(expect.objectContaining({
            name: "Order 1",
            idList: "todo-list",
            idLabels: expect.arrayContaining(["vip-label", "urgent-label", "bank-transfer-label", "return-less-than-4-label"])
        }));
    });

    it("normalizes thrown network failures as retryable operation failures", async () => {
        const trello = buildTrello({
            createComment: jest.fn().mockRejectedValue(new Error("Network down"))
        });
        const adapter = createOrderTrelloAdapter(trello);

        const result = await adapter.createShippingCodeComment("card-1", "VN123", "order-1");

        expect(result).toMatchObject({
            ok: false,
            operation: "create-comment",
            retryable: true,
            message: "Network down",
            retryPayload: {
                orderId: "order-1",
                trelloCardId: "card-1",
                shippingCode: "VN123"
            }
        });
    });

    it("preserves non-2xx-style status details from useAPI errors", async () => {
        const trello = buildTrello({
            updateCard: jest.fn().mockRejectedValue({
                status: 429,
                statusText: "Too Many Requests",
                body: {message: "rate limited"}
            })
        });
        const adapter = createOrderTrelloAdapter(trello);

        const result = await adapter.updateOrderCard(buildOrder(), buildCustomer());

        expect(result).toMatchObject({
            ok: false,
            operation: "update-card",
            retryable: true,
            status: 429,
            message: "rate limited",
            retryPayload: {
                orderId: "order-1",
                customerId: "customer-1",
                trelloCardId: "card-1"
            }
        });
    });

    it("returns non-retryable move-card failure when card ID is missing", async () => {
        const trello = buildTrello();
        const adapter = createOrderTrelloAdapter(trello);

        const result = await adapter.moveOrderCard("", "done-list", "order-1");

        expect(result).toMatchObject({
            ok: false,
            operation: "move-card",
            retryable: false,
            message: "Missing Trello card ID",
            retryPayload: {
                orderId: "order-1",
                trelloCardId: "",
                idList: "done-list"
            }
        });
        expect(trello.updateCard).not.toHaveBeenCalled();
    });

    it("returns attachment upload failure with order/card retry context and no secrets", async () => {
        const trello = buildTrello({
            createAttachment: jest.fn().mockRejectedValue(new Error("Upload failed"))
        });
        const adapter = createOrderTrelloAdapter(trello);

        const result = await adapter.createOrderAttachment(buildOrder(), {
            name: "photo.jpg",
            mimeType: "image/jpeg",
            file: new Blob(["image"])
        });

        expect(result).toMatchObject({
            ok: false,
            operation: "create-attachment",
            retryable: true,
            message: "Upload failed",
            retryPayload: {
                orderId: "order-1",
                trelloCardId: "card-1",
                attachment: {
                    name: "photo.jpg",
                    mimeType: "image/jpeg"
                },
                requiresFileReselect: true
            }
        });
        expect(JSON.stringify((result as any).retryPayload)).not.toContain("token");
        expect(JSON.stringify((result as any).retryPayload)).not.toContain("key-value");
    });
});

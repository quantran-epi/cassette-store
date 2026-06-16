import React, {useEffect} from "react";
import {act, render} from "@testing-library/react";
import {Provider} from "react-redux";
import {useOrder} from "./useOrder";
import {store} from "@store/Store";
import {removeAllDoneOrder, setOrderState} from "@store/Reducers/OrderReducer";
import {setCustomerState} from "@store/Reducers/CustomerReducer";
import {
    createOrderWorkflowFailure,
    createOrderWorkflowSuccess,
    getOrderWorkflowMessage,
    hasOrderWorkflowSyncFailures
} from "./OrderWorkflowResult";
import type {OrderSyncFailure} from "@store/Models/OrderSyncFailure";
import type {Order} from "@store/Models/Order";
import type {Customer} from "@store/Models/Customer";
import {
    ORDER_PAYMENT_METHOD,
    ORDER_PRIORITY_STATUS,
    ORDER_SHIPPING_PARTNER,
    ORDER_STATUS
} from "@common/Constants/AppConstants";

const mockGetCardsByList = jest.fn();
const mockCreateCard = jest.fn();
const mockUpdateCard = jest.fn();
const mockCreateComment = jest.fn();
const mockCreateAttachment = jest.fn();
const mockDeleteAttachment = jest.fn();
const mockGetAttachmentsOfCard = jest.fn();

jest.mock("idb-keyval", () => ({
    get: jest.fn(() => Promise.resolve(null)),
    set: jest.fn(() => Promise.resolve()),
    del: jest.fn(() => Promise.resolve())
}));

jest.mock("nanoid", () => ({
    nanoid: () => "test-id"
}));

jest.mock("./Trello/useTrello", () => ({
    useTrello: () => ({
        TRELLO_LIST_IDS: {
            TODO_LIST: "todo-list",
            DELIVERY_CREATED_LIST: "delivery-created-list",
            DONE_LIST: "done-list",
            NOT_DELIVERED_LIST: "not-delivered-list"
        },
        TRELLO_LIST_LABEL_IDS: {
            VIP: "label-vip",
            URGENT: "label-urgent",
            PRIORITY: "label-priority",
            BANK_TRANSFER_IN_ADVANCE: "label-bank-transfer",
            CUSTOMER_RETURN_LESS_THAN_4: "label-return-less-than-4"
        },
        getCardsByList: mockGetCardsByList,
        createCard: mockCreateCard,
        updateCard: mockUpdateCard,
        createComment: mockCreateComment,
        createAttachment: mockCreateAttachment,
        deleteAttachment: mockDeleteAttachment,
        getAttachmentsOfCard: mockGetAttachmentsOfCard
    })
}));

type UseOrderResult = ReturnType<typeof useOrder>;

const UseOrderHarness = (props: { onReady: (result: UseOrderResult) => void }) => {
    const orderUtils = useOrder();

    useEffect(() => {
        props.onReady(orderUtils);
    }, [orderUtils, props]);

    return null;
}

const renderUseOrder = (): { getOrderUtils: () => UseOrderResult } => {
    let orderUtils: UseOrderResult;

    render(React.createElement(
        Provider,
        {
            store,
            children: React.createElement(UseOrderHarness, {
                onReady: (result) => {
                    orderUtils = result;
                }
            })
        }
    ));

    return {
        getOrderUtils: () => orderUtils
    }
}

const seedDoneOrders = (doneOrders: string[]) => {
    store.dispatch(setOrderState({
        orders: [],
        lastSequence: 0,
        doneOrders,
        codPayments: [],
        syncFailures: []
    }));
}

const seedOrderState = (orders: Order[], customers: Customer[] = [buildCustomer()], syncFailures: OrderSyncFailure[] = []): void => {
    store.dispatch(setCustomerState({customers}));
    store.dispatch(setOrderState({
        orders,
        lastSequence: orders.length,
        doneOrders: [],
        codPayments: [],
        syncFailures
    }));
}

const buildCustomer = (overrides: Partial<Customer> = {}): Customer => ({
    id: "customer-1",
    name: "Customer One",
    province: "TP. Hồ Chí Minh",
    area: "Miền nam",
    address: "123 Test Street",
    mobile: "0900000000",
    buyCount: 0,
    buyAmount: 0,
    isVIP: false,
    isInBlacklist: false,
    difficulty: "Dễ",
    note: "",
    ...overrides
});

const buildOrder = (overrides: Partial<Order> = {}): Order => ({
    id: "order-1",
    sequence: 1,
    createdDate: "2026-06-16T00:00:00.000Z",
    name: "1. Customer One-TP. Hồ Chí Minh",
    placedItems: [],
    changeItems: [],
    status: ORDER_STATUS.PLACED,
    shippingCost: 20520,
    returnReason: "",
    isRefund: false,
    refundAmount: 0,
    paymentMethod: ORDER_PAYMENT_METHOD.CASH_COD,
    paymentAmount: 120000,
    shippingPartner: ORDER_SHIPPING_PARTNER.VNPOST,
    shippingCode: "",
    codAmount: 120000,
    priorityMark: 0,
    priorityStatus: ORDER_PRIORITY_STATUS.NONE,
    dueDate: "2026-06-17T00:00:00.000Z" as any,
    customerId: "customer-1",
    trelloCardId: "trello-card-1",
    position: 0,
    note: "",
    isFreeShip: false,
    isPayCOD: false,
    ...overrides
});

const buildFile = (name: string): File => {
    return new File(["image"], name, {type: "image/jpeg"});
}

const buildTrelloCard = (overrides = {}) => ({
    id: "trello-card-1",
    name: "Trello Card",
    desc: "Card desc",
    dueComplete: false,
    idList: "todo-list",
    start: new Date("2026-06-16T00:00:00.000Z"),
    pos: 0,
    url: "https://trello.test/card",
    attachments: [],
    ...overrides
});

const buildSyncFailure = (overrides: Partial<OrderSyncFailure> = {}): OrderSyncFailure => ({
    id: "failure-1",
    orderId: "order-1",
    operation: "create-card",
    status: "failed",
    message: "Could not create Trello card",
    retryable: true,
    createdAt: "2026-06-16T00:00:00.000Z",
    updatedAt: "2026-06-16T00:00:00.000Z",
    retryPayload: {orderId: "order-1"},
    ...overrides
});

beforeEach(() => {
    seedDoneOrders([]);
    mockGetCardsByList.mockReset();
    mockCreateCard.mockReset();
    mockUpdateCard.mockReset();
    mockCreateComment.mockReset();
    mockCreateAttachment.mockReset();
    mockDeleteAttachment.mockReset();
    mockGetAttachmentsOfCard.mockReset();
});

afterEach(() => {
    jest.restoreAllMocks();
});

describe("useOrder.refreshDoneOrders", () => {
    it("replaces done order ids after Trello success", async () => {
        seedDoneOrders(["old-done"]);
        mockGetCardsByList.mockResolvedValue([
            {id: "done-card-1", dueComplete: true},
            {id: "open-card", dueComplete: false},
            {id: "done-card-2", dueComplete: true}
        ]);
        const {getOrderUtils} = renderUseOrder();

        let count: number;
        await act(async () => {
            count = await getOrderUtils().refreshDoneOrders();
        });

        expect(mockGetCardsByList).toHaveBeenCalledWith("todo-list");
        expect(count).toBe(2);
        expect(store.getState().order.doneOrders).toEqual(["done-card-1", "done-card-2"]);
    });

    it("treats empty Trello success as a non-error empty state", async () => {
        seedDoneOrders(["old-done"]);
        mockGetCardsByList.mockResolvedValue([
            {id: "open-card", dueComplete: false}
        ]);
        const {getOrderUtils} = renderUseOrder();

        let count: number;
        await act(async () => {
            count = await getOrderUtils().refreshDoneOrders();
        });

        expect(count).toBe(0);
        expect(store.getState().order.doneOrders).toEqual([]);
    });

    it("preserves previous done order ids when Trello fails", async () => {
        seedDoneOrders(["old-done"]);
        mockGetCardsByList.mockRejectedValue(new Error("Trello down"));
        const dispatchSpy = jest.spyOn(store, "dispatch");
        const {getOrderUtils} = renderUseOrder();

        await expect(getOrderUtils().refreshDoneOrders()).rejects.toThrow("Trello down");

        expect(store.getState().order.doneOrders).toEqual(["old-done"]);
        expect(dispatchSpy).not.toHaveBeenCalledWith(expect.objectContaining({
            type: removeAllDoneOrder.type
        }));
    });
});

describe("OrderWorkflowResult helpers", () => {
    it("represents local success with retryable Trello sync failures", () => {
        const result = createOrderWorkflowSuccess({
            operation: "create-order",
            data: {orderId: "order-1"},
            syncFailures: [buildSyncFailure()],
            message: "Đã tạo đơn"
        });

        expect(result.ok).toBe(true);
        expect(result.localUpdated).toBe(true);
        expect(result.syncFailures).toHaveLength(1);
        expect(hasOrderWorkflowSyncFailures(result)).toBe(true);
        expect(getOrderWorkflowMessage(result)).toBe("Đã tạo đơn. Cần đồng bộ lại Trello.");
    });

    it("represents fatal local failure without requiring sync failure state", () => {
        const error = new Error("Local validation failed");
        const result = createOrderWorkflowFailure({
            operation: "create-order",
            message: "Không thể tạo đơn",
            error
        });

        expect(result.ok).toBe(false);
        expect(result.localUpdated).toBe(false);
        expect(result.syncFailures).toEqual([]);
        expect(hasOrderWorkflowSyncFailures(result)).toBe(false);
        expect(getOrderWorkflowMessage(result)).toBe("Không thể tạo đơn");
    });
});

describe("useOrder local-first Trello failure handling", () => {
    it("keeps a locally-created order and records sync failure when Trello card creation fails", async () => {
        const customer = buildCustomer();
        const order = buildOrder({trelloCardId: ""});
        seedOrderState([], [customer]);
        mockCreateCard.mockRejectedValue(new Error("Trello create failed"));
        const {getOrderUtils} = renderUseOrder();

        let result;
        await act(async () => {
            result = await getOrderUtils().createOrder(order, customer, []);
        });

        const state = store.getState().order;
        expect(result.localUpdated).toBe(true);
        expect(result.syncFailures).toHaveLength(1);
        expect(state.orders.find(item => item.id === order.id)).toBeTruthy();
        expect(state.orders.find(item => item.id === order.id).trelloCardId).toBe("");
        expect(state.syncFailures).toEqual(expect.arrayContaining([
            expect.objectContaining({
                orderId: order.id,
                operation: "create-card",
                status: "failed",
                retryable: true,
                message: "Trello create failed"
            })
        ]));
    });

    it("saves shipping code locally and records sync failure when Trello comment fails", async () => {
        const customer = buildCustomer();
        const order = buildOrder({shippingCode: "", status: ORDER_STATUS.PLACED});
        seedOrderState([order], [customer]);
        mockCreateComment.mockRejectedValue(new Error("Comment failed"));
        const {getOrderUtils} = renderUseOrder();

        let result;
        await act(async () => {
            result = await getOrderUtils().changeShippingCode(order.id, "VN123456");
        });

        const updatedOrder = store.getState().order.orders.find(item => item.id === order.id);
        expect(result.localUpdated).toBe(true);
        expect(updatedOrder.status).toBe(ORDER_STATUS.CREATE_DELIVERY);
        expect(updatedOrder.shippingCode).toBe("VN123456");
        expect(store.getState().order.syncFailures).toEqual(expect.arrayContaining([
            expect.objectContaining({
                orderId: order.id,
                operation: "create-comment",
                status: "failed",
                message: "Comment failed",
                retryPayload: expect.objectContaining({shippingCode: "VN123456"})
            })
        ]));
    });

    it("marks an order shipped locally and records sync failure when Trello move fails", async () => {
        const customer = buildCustomer({buyCount: 1, buyAmount: 500000});
        const order = buildOrder({paymentAmount: 120000});
        seedOrderState([order], [customer]);
        mockUpdateCard.mockRejectedValue(new Error("Move failed"));
        const {getOrderUtils} = renderUseOrder();

        let result;
        await act(async () => {
            result = await getOrderUtils().markOrderAsShipped(order.id);
        });

        const updatedOrder = store.getState().order.orders.find(item => item.id === order.id);
        const updatedCustomer = store.getState().customer.customers.find(item => item.id === customer.id);
        expect(result.localUpdated).toBe(true);
        expect(updatedOrder.status).toBe(ORDER_STATUS.SHIPPED);
        expect(updatedCustomer.buyCount).toBe(2);
        expect(updatedCustomer.buyAmount).toBe(620000);
        expect(store.getState().order.syncFailures).toEqual(expect.arrayContaining([
            expect.objectContaining({
                orderId: order.id,
                operation: "move-card",
                status: "failed",
                message: "Move failed",
                retryPayload: expect.objectContaining({idList: "done-list"})
            })
        ]));
    });

    it("records failed attachment upload without removing the local order", async () => {
        const customer = buildCustomer();
        const order = buildOrder();
        seedOrderState([order], [customer]);
        mockCreateAttachment.mockRejectedValue(new Error("Upload failed"));
        const {getOrderUtils} = renderUseOrder();

        let result;
        await act(async () => {
            result = await getOrderUtils().attachImagesToOrderOnTrello(order, [buildFile("order.jpg") as any]);
        });

        expect(result.localUpdated).toBe(true);
        expect(result.data).toEqual([]);
        expect(store.getState().order.orders.find(item => item.id === order.id)).toBeTruthy();
        expect(store.getState().order.syncFailures).toEqual(expect.arrayContaining([
            expect.objectContaining({
                orderId: order.id,
                operation: "create-attachment",
                status: "failed",
                message: "Upload failed",
                retryPayload: expect.objectContaining({
                    attachment: expect.objectContaining({name: "1. Customer One-TP. Hồ Chí Minhattachmenttest-id"})
                })
            })
        ]));
    });
});

describe("useOrder sync failure retry handling", () => {
    it("retries failed card creation, stores Trello card ID, and clears the failure", async () => {
        const customer = buildCustomer();
        const order = buildOrder({trelloCardId: ""});
        const failure = buildSyncFailure({
            id: "failure-create-card",
            orderId: order.id,
            operation: "create-card",
            trelloCardId: undefined,
            retryPayload: {orderId: order.id, customerId: customer.id, idList: "todo-list"}
        });
        seedOrderState([order], [customer], [failure]);
        mockCreateCard.mockResolvedValue(buildTrelloCard({id: "trello-card-new"}));
        const {getOrderUtils} = renderUseOrder();

        expect(getOrderUtils().retryOrderSyncFailure).toEqual(expect.any(Function));
        expect(getOrderUtils().clearOrderSyncFailure).toEqual(expect.any(Function));

        let result;
        await act(async () => {
            result = await getOrderUtils().retryOrderSyncFailure(failure.id);
        });

        const updatedOrder = store.getState().order.orders.find(item => item.id === order.id);
        expect(result.localUpdated).toBe(true);
        expect(mockCreateCard).toHaveBeenCalledWith(expect.objectContaining({idList: "todo-list"}));
        expect(updatedOrder.trelloCardId).toBe("trello-card-new");
        expect(store.getState().order.syncFailures).toEqual([]);
    });

    it("retries failed card move and clears only the matching failure", async () => {
        const customer = buildCustomer();
        const order = buildOrder();
        const moveFailure = buildSyncFailure({
            id: "failure-move-card",
            orderId: order.id,
            operation: "move-card",
            retryPayload: {orderId: order.id, trelloCardId: order.trelloCardId, idList: "done-list"}
        });
        const commentFailure = buildSyncFailure({
            id: "failure-comment",
            orderId: order.id,
            operation: "create-comment",
            retryPayload: {orderId: order.id, trelloCardId: order.trelloCardId, shippingCode: "VN123"}
        });
        seedOrderState([order], [customer], [moveFailure, commentFailure]);
        mockUpdateCard.mockResolvedValue(buildTrelloCard({idList: "done-list"}));
        const {getOrderUtils} = renderUseOrder();

        let result;
        await act(async () => {
            result = await getOrderUtils().retryOrderSyncFailure(moveFailure.id);
        });

        expect(result.localUpdated).toBe(true);
        expect(mockUpdateCard).toHaveBeenCalledWith({id: order.trelloCardId, idList: "done-list"});
        expect(store.getState().order.syncFailures.map(item => item.id)).toEqual([commentFailure.id]);
    });

    it("leaves a retry failure in failed status with a newer updated timestamp", async () => {
        const customer = buildCustomer();
        const order = buildOrder();
        const failure = buildSyncFailure({
            id: "failure-move-card",
            orderId: order.id,
            operation: "move-card",
            message: "Old failure",
            updatedAt: "2026-06-16T00:00:00.000Z",
            retryPayload: {orderId: order.id, trelloCardId: order.trelloCardId, idList: "done-list"}
        });
        seedOrderState([order], [customer], [failure]);
        mockUpdateCard.mockRejectedValue(new Error("Still down"));
        const {getOrderUtils} = renderUseOrder();

        let result;
        await act(async () => {
            result = await getOrderUtils().retryOrderSyncFailure(failure.id);
        });

        const retriedFailure = store.getState().order.syncFailures.find(item => item.id === failure.id);
        expect(result.localUpdated).toBe(false);
        expect(result.message).toBe("Still down");
        expect(retriedFailure.status).toBe("failed");
        expect(retriedFailure.message).toBe("Still down");
        expect(retriedFailure.updatedAt).not.toBe("2026-06-16T00:00:00.000Z");
    });

    it("returns manual reselect guidance for persisted attachment failures without clearing them", async () => {
        const customer = buildCustomer();
        const order = buildOrder();
        const failure = buildSyncFailure({
            id: "failure-attachment",
            orderId: order.id,
            operation: "create-attachment",
            retryPayload: {
                orderId: order.id,
                trelloCardId: order.trelloCardId,
                attachment: {name: "order.jpg", mimeType: "image/jpeg"},
                requiresFileReselect: true
            }
        });
        seedOrderState([order], [customer], [failure]);
        const {getOrderUtils} = renderUseOrder();

        let result;
        await act(async () => {
            result = await getOrderUtils().retryOrderSyncFailure(failure.id);
        });

        const persistedFailure = store.getState().order.syncFailures.find(item => item.id === failure.id);
        expect(result.localUpdated).toBe(false);
        expect(result.message).toBe("Cần chọn lại ảnh để đồng bộ Trello");
        expect(mockCreateAttachment).not.toHaveBeenCalled();
        expect(persistedFailure).toMatchObject({
            id: failure.id,
            status: "failed",
            message: "Cần chọn lại ảnh để đồng bộ Trello"
        });
    });
});

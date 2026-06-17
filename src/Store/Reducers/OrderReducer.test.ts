jest.mock("nanoid", () => ({
    nanoid: () => "test-id"
}));

import reducer, {
    clearOrderSyncFailures,
    clearSyncFailure,
    markSyncFailureRetrying,
    setDoneOrders,
    setOrderState,
    upsertCodPayment,
    upsertSyncFailure
} from "./OrderReducer";
import type {OrderState} from "./OrderReducer";
import type {Order} from "@store/Models/Order";
import type {CodPaymentCycle} from "@store/Models/CodPaymentCycle";
import type {OrderSyncFailure} from "@store/Models/OrderSyncFailure";
import {
    ORDER_PAYMENT_METHOD,
    ORDER_PRIORITY_STATUS,
    ORDER_SHIPPING_PARTNER,
    ORDER_STATUS
} from "@common/Constants/AppConstants";

const buildOrder = (id: string, sequence: number): Order => ({
    id,
    sequence,
    createdDate: "2026-06-15T00:00:00.000Z",
    name: `Order ${sequence}`,
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
    dueDate: new Date("2026-06-16T00:00:00.000Z"),
    customerId: "customer-1",
    trelloCardId: "trello-card-1",
    position: 0,
    note: "",
    isFreeShip: false,
    isPayCOD: true
});

const buildCodPayment = (id: string): CodPaymentCycle => ({
    id,
    name: `Cycle ${id}`,
    cycleDate: "2026-06-15T00:00:00.000Z",
    paymentOrders: ["order-1"],
    debitFeeOrders: ["order-2"]
});

const buildSyncFailure = (id: string, overrides: Partial<OrderSyncFailure> = {}): OrderSyncFailure => ({
    id,
    orderId: "order-1",
    operation: "create-card",
    status: "failed",
    message: `Failure ${id}`,
    retryable: true,
    createdAt: "2026-06-15T00:00:00.000Z",
    updatedAt: "2026-06-15T00:00:00.000Z",
    trelloCardId: "trello-card-1",
    retryPayload: {orderId: "order-1"},
    ...overrides
});

describe("OrderReducer restore actions", () => {
    it("restores all persisted order fields from backup state", () => {
        const backupState: OrderState = {
            orders: [buildOrder("order-1", 23)],
            lastSequence: 23,
            doneOrders: ["done-1", "done-2"],
            codPayments: [buildCodPayment("cod-1")],
            syncFailures: [buildSyncFailure("failure-1")]
        };

        const state = reducer(undefined, setOrderState(backupState));

        expect(state.orders).toEqual(backupState.orders);
        expect(state.lastSequence).toBe(23);
        expect(state.doneOrders).toEqual(["done-1", "done-2"]);
        expect(state.codPayments).toEqual(backupState.codPayments);
        expect(state.syncFailures).toEqual(backupState.syncFailures);
    });

    it("defaults recoverable persisted arrays when old backups omit them", () => {
        const state = reducer(undefined, setOrderState({
            orders: [buildOrder("order-legacy", 7)],
            lastSequence: 7
        } as OrderState));

        expect(state.orders).toHaveLength(1);
        expect(state.lastSequence).toBe(7);
        expect(state.doneOrders).toEqual([]);
        expect(state.codPayments).toEqual([]);
        expect(state.syncFailures).toEqual([]);
    });

    it("replaces done orders atomically", () => {
        const previousState: OrderState = {
            orders: [],
            lastSequence: 0,
            doneOrders: ["old-done"],
            codPayments: [],
            syncFailures: []
        };

        const state = reducer(previousState, setDoneOrders(["new-done-1", "new-done-2"]));

        expect(state.doneOrders).toEqual(["new-done-1", "new-done-2"]);
    });

    it("upserts sync failures by id without touching other failures", () => {
        const previousState: OrderState = {
            orders: [],
            lastSequence: 0,
            doneOrders: [],
            codPayments: [],
            syncFailures: [
                buildSyncFailure("failure-1", {message: "Old message"}),
                buildSyncFailure("failure-2", {orderId: "order-2", operation: "move-card"})
            ]
        };

        const updatedFailure = buildSyncFailure("failure-1", {
            message: "Updated message",
            operation: "create-comment",
            retryPayload: {shippingCode: "VN123"}
        });
        const afterUpdate = reducer(previousState, upsertSyncFailure(updatedFailure));
        const afterInsert = reducer(afterUpdate, upsertSyncFailure(buildSyncFailure("failure-3", {operation: "create-attachment"})));

        expect(afterUpdate.syncFailures).toHaveLength(2);
        expect(afterUpdate.syncFailures.find(failure => failure.id === "failure-1")).toMatchObject({
            message: "Updated message",
            operation: "create-comment",
            retryPayload: {shippingCode: "VN123"}
        });
        expect(afterUpdate.syncFailures.find(failure => failure.id === "failure-2")).toEqual(previousState.syncFailures[1]);
        expect(afterInsert.syncFailures).toHaveLength(3);
        expect(afterInsert.syncFailures.map(failure => failure.id)).toContain("failure-3");
    });

    it("marks only the selected sync failure as retrying", () => {
        const previousState: OrderState = {
            orders: [],
            lastSequence: 0,
            doneOrders: [],
            codPayments: [],
            syncFailures: [buildSyncFailure("failure-1"), buildSyncFailure("failure-2")]
        };

        const state = reducer(previousState, markSyncFailureRetrying({
            id: "failure-2",
            updatedAt: "2026-06-16T00:00:00.000Z"
        }));

        expect(state.syncFailures.find(failure => failure.id === "failure-1").status).toBe("failed");
        expect(state.syncFailures.find(failure => failure.id === "failure-2")).toMatchObject({
            status: "retrying",
            updatedAt: "2026-06-16T00:00:00.000Z"
        });
    });

    it("clears one sync failure by id", () => {
        const previousState: OrderState = {
            orders: [],
            lastSequence: 0,
            doneOrders: [],
            codPayments: [],
            syncFailures: [buildSyncFailure("failure-1"), buildSyncFailure("failure-2")]
        };

        const state = reducer(previousState, clearSyncFailure("failure-1"));

        expect(state.syncFailures.map(failure => failure.id)).toEqual(["failure-2"]);
    });

    it("clears sync failures by order and optional operation", () => {
        const previousState: OrderState = {
            orders: [],
            lastSequence: 0,
            doneOrders: [],
            codPayments: [],
            syncFailures: [
                buildSyncFailure("failure-1", {orderId: "order-1", operation: "create-card"}),
                buildSyncFailure("failure-2", {orderId: "order-1", operation: "move-card"}),
                buildSyncFailure("failure-3", {orderId: "order-2", operation: "move-card"})
            ]
        };

        const operationCleared = reducer(previousState, clearOrderSyncFailures({
            orderId: "order-1",
            operation: "move-card"
        }));
        const orderCleared = reducer(previousState, clearOrderSyncFailures({orderId: "order-1"}));

        expect(operationCleared.syncFailures.map(failure => failure.id)).toEqual(["failure-1", "failure-3"]);
        expect(orderCleared.syncFailures.map(failure => failure.id)).toEqual(["failure-3"]);
    });
});

describe("OrderReducer COD payment actions", () => {
    it("upserts COD payments by id without duplicating an imported cycle", () => {
        const previousState: OrderState = {
            orders: [],
            lastSequence: 0,
            doneOrders: [],
            codPayments: [
                buildCodPayment("cod-1"),
                buildCodPayment("cod-import")
            ],
            syncFailures: []
        };
        const updatedImport = {
            ...buildCodPayment("cod-import"),
            name: "Updated imported COD cycle",
            paymentOrders: ["order-3"],
            debitFeeOrders: ["order-4"]
        };

        const afterReplace = reducer(previousState, upsertCodPayment(updatedImport));
        const afterInsert = reducer(afterReplace, upsertCodPayment(buildCodPayment("cod-new")));

        expect(afterReplace.codPayments).toHaveLength(2);
        expect(afterReplace.codPayments.find(payment => payment.id === "cod-1")).toEqual(previousState.codPayments[0]);
        expect(afterReplace.codPayments.find(payment => payment.id === "cod-import")).toMatchObject({
            name: "Updated imported COD cycle",
            paymentOrders: ["order-3"],
            debitFeeOrders: ["order-4"]
        });
        expect(afterInsert.codPayments.map(payment => payment.id)).toEqual(["cod-1", "cod-import", "cod-new"]);
    });
});

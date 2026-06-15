jest.mock("nanoid", () => ({
    nanoid: () => "test-id"
}));

import reducer, {setDoneOrders, setOrderState} from "./OrderReducer";
import type {OrderState} from "./OrderReducer";
import type {Order} from "@store/Models/Order";
import type {CodPaymentCycle} from "@store/Models/CodPaymentCycle";
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

describe("OrderReducer restore actions", () => {
    it("restores all persisted order fields from backup state", () => {
        const backupState: OrderState = {
            orders: [buildOrder("order-1", 23)],
            lastSequence: 23,
            doneOrders: ["done-1", "done-2"],
            codPayments: [buildCodPayment("cod-1")]
        };

        const state = reducer(undefined, setOrderState(backupState));

        expect(state.orders).toEqual(backupState.orders);
        expect(state.lastSequence).toBe(23);
        expect(state.doneOrders).toEqual(["done-1", "done-2"]);
        expect(state.codPayments).toEqual(backupState.codPayments);
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
    });

    it("replaces done orders atomically", () => {
        const previousState: OrderState = {
            orders: [],
            lastSequence: 0,
            doneOrders: ["old-done"],
            codPayments: []
        };

        const state = reducer(previousState, setDoneOrders(["new-done-1", "new-done-2"]));

        expect(state.doneOrders).toEqual(["new-done-1", "new-done-2"]);
    });
});

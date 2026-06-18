import {ORDER_PAYMENT_METHOD, ORDER_PRIORITY_STATUS, ORDER_RETURN_REASON, ORDER_SHIPPING_PARTNER, ORDER_STATUS} from "@common/Constants/AppConstants";
import type {Customer} from "@store/Models/Customer";
import type {Order} from "@store/Models/Order";
import {buildDashboardReadModel} from "./DashboardSelectors";

const buildCustomer = (overrides: Partial<Customer> = {}): Customer => ({
    id: "customer-1",
    name: "Alice Nguyen",
    province: "TP. Hồ Chí Minh",
    area: "Miền nam",
    address: "12 Nguyen Hue",
    mobile: "0901111222",
    buyCount: 1,
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
    createdDate: "2026-06-15T08:00:00.000Z",
    name: "Alice order",
    placedItems: [{id: "item-1", count: 2, type: "SONY-50K", unitPrice: 50000, note: ""}],
    changeItems: [],
    status: ORDER_STATUS.SHIPPED,
    shippingCost: 20000,
    returnReason: "",
    isRefund: false,
    refundAmount: 0,
    paymentMethod: ORDER_PAYMENT_METHOD.CASH_COD,
    paymentAmount: 120000,
    shippingPartner: ORDER_SHIPPING_PARTNER.VNPOST,
    shippingCode: "VN001",
    codAmount: 120000,
    priorityMark: 5,
    priorityStatus: ORDER_PRIORITY_STATUS.NONE,
    dueDate: new Date("2026-06-16T00:00:00.000Z"),
    customerId: "customer-1",
    trelloCardId: "trello-1",
    position: 0,
    note: "",
    isFreeShip: false,
    isPayCOD: false,
    ...overrides
});

describe("DashboardSelectors", () => {
    it("preserves dashboard totals and customer summaries from existing formulas", () => {
        const customers: Customer[] = [
            buildCustomer({id: "customer-1", name: "Alice", buyCount: 2}),
            buildCustomer({id: "customer-2", name: "Bob", buyCount: 4, isVIP: true}),
            buildCustomer({id: "customer-3", name: "Carol", buyCount: 0, isInBlacklist: true})
        ];
        const orders: Order[] = [
            buildOrder({
                id: "paid-cod",
                customerId: "customer-1",
                paymentAmount: 120000,
                codAmount: 120000,
                shippingCost: 20000,
                isPayCOD: true,
                placedItems: [{id: "item-1", count: 2, type: "SONY-50K", unitPrice: 50000, note: ""}]
            }),
            buildOrder({
                id: "unpaid-cod",
                customerId: "customer-2",
                paymentAmount: 220000,
                codAmount: 220000,
                shippingCost: 30000,
                isPayCOD: false,
                placedItems: [{id: "item-2", count: 1, type: "MAXELL-90p-100K", unitPrice: 100000, note: ""}]
            }),
            buildOrder({
                id: "bank-transfer",
                customerId: "customer-2",
                paymentMethod: ORDER_PAYMENT_METHOD.BANK_TRANSFER_IN_ADVANCE,
                paymentAmount: 180000,
                codAmount: 0,
                shippingCost: 25000,
                isPayCOD: false,
                placedItems: [{id: "item-3", count: 3, type: "SONY-50K", unitPrice: 50000, note: ""}]
            }),
            buildOrder({
                id: "returned-bom",
                customerId: "customer-3",
                status: ORDER_STATUS.RETURNED,
                returnReason: ORDER_RETURN_REASON.REFUSE_TO_RECEIVE,
                paymentAmount: 90000,
                codAmount: 90000,
                shippingCost: 18000,
                placedItems: [{id: "item-4", count: 1, type: "SONY-50K", unitPrice: 50000, note: ""}]
            })
        ];

        const model = buildDashboardReadModel(orders, customers);

        expect(model.totals.bankTransferAmount).toBe(180000);
        expect(model.totals.totalCodAmount).toBe(430000);
        expect(model.totals.totalShippingCost).toBe(93000);
        expect(model.totals.codPaidAmount).toBe(100000);
        expect(model.totals.codUnpaidShippedAmount).toBe(190000);
        expect(model.totals.codNotShippedAmount).toBe(72000);
        expect(model.totals.refuseToReceiveOrderCount).toBe(1);
        expect(model.totals.refuseToReceiveCassetteCount).toBe(1);
        expect(model.totals.refuseToReceiveShippingCost).toBe(18000);
        expect(model.customers.repeatSecondPurchaseCount).toBe(1);
        expect(model.customers.repeatThreePlusPurchaseCount).toBe(1);
        expect(model.customers.vipCount).toBe(1);
        expect(model.customers.blacklistCount).toBe(1);
        expect(model.customers.topByAmount.map(item => item.customer.id)).toEqual(["customer-2", "customer-1", "customer-3"]);
        expect(model.customers.topByBuyCount.map(item => item.customer.id)).toEqual(["customer-2", "customer-1", "customer-3"]);
    });

    it("groups dashboard metrics by operator decisions from selector values", () => {
        const customers: Customer[] = [
            buildCustomer({id: "customer-1", name: "Alice", buyCount: 2}),
            buildCustomer({id: "customer-2", name: "Bob", buyCount: 4, isVIP: true}),
            buildCustomer({id: "customer-3", name: "Carol", buyCount: 0, isInBlacklist: true})
        ];
        const orders: Order[] = [
            buildOrder({
                id: "paid-cod",
                customerId: "customer-1",
                paymentAmount: 120000,
                codAmount: 120000,
                shippingCost: 20000,
                isPayCOD: true
            }),
            buildOrder({
                id: "unpaid-cod",
                customerId: "customer-2",
                paymentAmount: 220000,
                codAmount: 220000,
                shippingCost: 30000,
                isPayCOD: false
            }),
            buildOrder({
                id: "bank-transfer",
                customerId: "customer-2",
                paymentMethod: ORDER_PAYMENT_METHOD.BANK_TRANSFER_IN_ADVANCE,
                paymentAmount: 180000,
                codAmount: 0,
                shippingCost: 25000,
                isPayCOD: false
            }),
            buildOrder({
                id: "returned-bom",
                customerId: "customer-3",
                status: ORDER_STATUS.RETURNED,
                returnReason: ORDER_RETURN_REASON.REFUSE_TO_RECEIVE,
                paymentAmount: 90000,
                codAmount: 90000,
                shippingCost: 18000,
                placedItems: [{id: "item-4", count: 1, type: "SONY-50K", unitPrice: 50000, note: ""}]
            })
        ];

        const model = buildDashboardReadModel(orders, customers);

        expect(Object.keys(model.decisionGroups)).toEqual([
            "codToReconcile",
            "shippingAttention",
            "cashHealth",
            "customerFollowUp",
            "returnAttention"
        ]);
        expect(model.decisionGroups.codToReconcile.title).toBe("COD cần đối soát");
        expect(model.decisionGroups.codToReconcile.metrics).toEqual(expect.arrayContaining([
            expect.objectContaining({key: "codPaidAmount", value: 100000, suffix: "đ"}),
            expect.objectContaining({key: "codUnpaidShippedAmount", value: 190000, suffix: "đ"}),
            expect.objectContaining({key: "codNotShippedAmount", value: 72000, suffix: "đ"})
        ]));
        expect(model.decisionGroups.shippingAttention.metrics).toEqual(expect.arrayContaining([
            expect.objectContaining({key: "codOrderCount", value: 3}),
            expect.objectContaining({key: "orderCount", value: 4})
        ]));
        expect(model.decisionGroups.cashHealth.metrics).toEqual(expect.arrayContaining([
            expect.objectContaining({key: "bankTransferAmount", value: 180000, suffix: "đ"}),
            expect.objectContaining({key: "actualInterest", value: 127000, suffix: "đ"})
        ]));
        expect(model.decisionGroups.customerFollowUp.metrics).toEqual(expect.arrayContaining([
            expect.objectContaining({key: "repeatSecondPurchaseCount", value: 1}),
            expect.objectContaining({key: "vipCount", value: 1}),
            expect.objectContaining({key: "blacklistCount", value: 1})
        ]));
        expect(model.decisionGroups.returnAttention.metrics).toEqual(expect.arrayContaining([
            expect.objectContaining({key: "refuseToReceiveOrderCount", value: 1}),
            expect.objectContaining({key: "refuseToReceiveCassetteCount", value: 1}),
            expect.objectContaining({key: "refuseToReceiveShippingCost", value: 18000, suffix: "đ"})
        ]));
    });
});

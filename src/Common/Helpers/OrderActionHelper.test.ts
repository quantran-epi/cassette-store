import {ORDER_PAYMENT_METHOD, ORDER_PRIORITY_STATUS, ORDER_SHIPPING_PARTNER, ORDER_STATUS} from "@common/Constants/AppConstants";
import type {Order} from "@store/Models/Order";
import {buildOrderActionModel, OrderActionFlags, OrderActionKey} from "./OrderActionHelper";

const buildOrder = (overrides: Partial<Order> = {}): Order => ({
    id: "order-1",
    sequence: 1,
    createdDate: "2026-06-15T08:00:00.000Z",
    name: "Action order",
    placedItems: [],
    changeItems: [],
    status: ORDER_STATUS.PLACED,
    shippingCost: 20000,
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
    trelloCardId: "trello-1",
    position: 0,
    note: "",
    isFreeShip: false,
    isPayCOD: false,
    ...overrides
});

const baseFlags = (overrides: Partial<OrderActionFlags> = {}): OrderActionFlags => ({
    isPushedTrello: true,
    canMarkAsShipped: false,
    canMarkAsPayCOD: false,
    canMarkAsWaitingForReturn: false,
    canMarkAsReturned: false,
    isRefuseToReceive: false,
    isBrokenItems: false,
    hasShippingCode: true,
    doneInTrello: false,
    ...overrides
});

describe("OrderActionHelper", () => {
    it.each([
        ["pushed Trello order missing shipping code", buildOrder({shippingCode: ""}), baseFlags({hasShippingCode: false}), "input-shipping-code"],
        ["order that can be marked shipped", buildOrder({shippingCode: "VN001"}), baseFlags({canMarkAsShipped: true}), "mark-as-done"],
        ["shipped COD order that can be marked paid COD", buildOrder({status: ORDER_STATUS.SHIPPED, shippingCode: "VN001"}), baseFlags({canMarkAsPayCOD: true}), "mark-as-payed-cod"],
        ["waiting-return order that can be marked returned", buildOrder({status: ORDER_STATUS.WAITING_FOR_RETURNED, shippingCode: "VN001"}), baseFlags({canMarkAsReturned: true}), "returned-order"],
        ["order with no clear primary action", buildOrder({shippingCode: "VN001"}), baseFlags(), undefined]
    ])("selects primary next action for %s", (_label, order, flags, expectedKey) => {
        const model = buildOrderActionModel(order, flags);

        expect(model.primaryAction?.key).toBe(expectedKey);
        if (expectedKey) expect(model.actions.filter(action => action.isPrimary).map(action => action.key)).toEqual([expectedKey]);
    });

    it("groups secondary actions into delivery, details, customer, and danger", () => {
        const model = buildOrderActionModel(buildOrder({shippingCode: "VN001"}), baseFlags({canMarkAsShipped: true}));

        expect(Object.keys(model.groups)).toEqual(["delivery", "details", "customer", "danger"]);
        expect(model.groups.delivery.map(action => action.key)).toContain("mark-as-done");
        expect(model.groups.details.map(action => action.key)).toEqual(expect.arrayContaining(["place-items", "priority", "file-attachment", "order-bill"]));
        expect(model.groups.customer.map(action => action.key)).toContain("customer-info");
        expect(model.groups.danger.map(action => action.key)).toEqual(expect.arrayContaining(["delete", "refuse-to-receive", "returned-order", "broken-items"]));
    });

    it("marks dangerous and irreversible action keys as requiring confirmation", () => {
        const model = buildOrderActionModel(buildOrder({shippingCode: "VN001"}), baseFlags({canMarkAsPayCOD: true, canMarkAsReturned: true}));
        const dangerousKeys: OrderActionKey[] = ["delete", "refuse-to-receive", "returned-order", "broken-items", "mark-as-payed-cod"];

        dangerousKeys.forEach(key => {
            expect(model.actions.find(action => action.key === key)?.requiresConfirmation).toBe(true);
        });
    });
});

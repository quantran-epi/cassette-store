jest.mock("nanoid", () => ({
    nanoid: () => "test-id"
}));

import {OrderDomainHelper, ORDER_TRELLO_LABEL_KEYS} from "./OrderDomainHelper";
import {Order} from "@store/Models/Order";
import {Customer} from "@store/Models/Customer";
import {
    CUSTOMER_AREAS,
    CUSTOMER_DIFFUCULTIES,
    ORDER_PAYMENT_METHOD,
    ORDER_PRIORITY_STATUS,
    ORDER_RETURN_REASON,
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
    buyCount: 0,
    buyAmount: 0,
    isVIP: false,
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
        {
            id: "item-1",
            count: 3,
            type: "SONY-50K",
            unitPrice: 50000,
            note: ""
        }
    ],
    changeItems: [],
    status: ORDER_STATUS.PLACED,
    shippingCost: 25000,
    returnReason: "",
    isRefund: false,
    refundAmount: 0,
    paymentMethod: ORDER_PAYMENT_METHOD.CASH_COD,
    paymentAmount: 150000,
    shippingPartner: ORDER_SHIPPING_PARTNER.VNPOST,
    shippingCode: "",
    codAmount: 175000,
    priorityMark: 0,
    priorityStatus: ORDER_PRIORITY_STATUS.NONE,
    dueDate: new Date("2026-06-16T00:00:00.000Z"),
    customerId: "customer-1",
    trelloCardId: "trello-card-1",
    position: 0,
    note: "Giao giờ hành chính",
    isFreeShip: false,
    isPayCOD: false,
    ...overrides
});

describe("OrderDomainHelper transitions", () => {
    it("marks an order as shipped and updates customer totals without mutating inputs", () => {
        const order = buildOrder({
            status: ORDER_STATUS.WAITING_FOR_RETURNED,
            returnReason: ORDER_RETURN_REASON.BROKEN_ITEMS,
            paymentAmount: 400000
        });
        const customer = buildCustomer({
            buyCount: 4,
            buyAmount: 1600000,
            isVIP: false
        });

        const result = OrderDomainHelper.markOrderAsShippedTransition(order, customer);

        expect(result.order.status).toBe(ORDER_STATUS.SHIPPED);
        expect(result.order.returnReason).toBeNull();
        expect(result.customer.buyCount).toBe(5);
        expect(result.customer.buyAmount).toBe(2000000);
        expect(result.customer.isVIP).toBe(true);
        expect(order.status).toBe(ORDER_STATUS.WAITING_FOR_RETURNED);
        expect(order.returnReason).toBe(ORDER_RETURN_REASON.BROKEN_ITEMS);
        expect(customer.buyCount).toBe(4);
        expect(customer.buyAmount).toBe(1600000);
    });

    it("marks refused orders as waiting for return and blacklists the customer", () => {
        const order = buildOrder();
        const customer = buildCustomer({isVIP: true, isInBlacklist: false});

        const result = OrderDomainHelper.markOrderAsRefuseToReceiveTransition(order, customer);

        expect(result.order.status).toBe(ORDER_STATUS.WAITING_FOR_RETURNED);
        expect(result.order.returnReason).toBe(ORDER_RETURN_REASON.REFUSE_TO_RECEIVE);
        expect(result.customer.isInBlacklist).toBe(true);
        expect(result.customer.isVIP).toBe(false);
        expect(customer.isVIP).toBe(true);
        expect(customer.isInBlacklist).toBe(false);
    });

    it("stores shipping code, moves to create-delivery status, and reports first code", () => {
        const order = buildOrder({status: ORDER_STATUS.PLACED, shippingCode: ""});
        const customer = buildCustomer();

        const first = OrderDomainHelper.changeShippingCodeTransition(order, customer, "VN123");
        const second = OrderDomainHelper.changeShippingCodeTransition(first.order, customer, "VN456");

        expect(first.order.status).toBe(ORDER_STATUS.CREATE_DELIVERY);
        expect(first.order.shippingCode).toBe("VN123");
        expect(first.isFirstShippingCode).toBe(true);
        expect(second.order.status).toBe(ORDER_STATUS.CREATE_DELIVERY);
        expect(second.order.shippingCode).toBe("VN456");
        expect(second.isFirstShippingCode).toBe(false);
        expect(order.shippingCode).toBe("");
    });

    it("marks COD paid and applies refund values", () => {
        const order = buildOrder({isPayCOD: false, isRefund: false, refundAmount: 0});
        const customer = buildCustomer();

        const paid = OrderDomainHelper.markOrderAsPayCODTransition(order, customer);
        const refunded = OrderDomainHelper.refundTransition(order, customer, 50000);
        const clearedRefund = OrderDomainHelper.refundTransition(refunded.order, customer, 0);

        expect(paid.order.isPayCOD).toBe(true);
        expect(refunded.order.isRefund).toBe(true);
        expect(refunded.order.refundAmount).toBe(50000);
        expect(clearedRefund.order.isRefund).toBe(false);
        expect(clearedRefund.order.refundAmount).toBe(0);
        expect(order.isPayCOD).toBe(false);
        expect(order.isRefund).toBe(false);
    });
});

describe("OrderDomainHelper calculations", () => {
    it("builds the existing Trello card description content", () => {
        const order = buildOrder({codAmount: 175000, note: "Giao giờ hành chính"});
        const customer = buildCustomer({
            name: "Tran Thi B",
            mobile: "0911222333",
            address: "99 Nguyen Trai"
        });

        const desc = OrderDomainHelper.buildOrderTrelloDescription(order, customer);

        expect(desc).toContain("Tran Thi B");
        expect(desc).toContain("0911222333");
        expect(desc).toContain("99 Nguyen Trai");
        expect(desc).toContain("3 băng SONY-50K");
        expect(desc).toContain("Thu 175,000đ");
        expect(desc).toContain("Giao giờ hành chính");
    });

    it("calculates payment and COD amounts from current order rules", () => {
        const customer = buildCustomer({area: CUSTOMER_AREAS[1]});
        const placedItems = [
            {id: "item-1", count: 2, type: "SONY-50K", unitPrice: 50000, note: ""},
            {id: "item-2", count: 1, type: "TDK-90p-80K", unitPrice: 80000, note: ""}
        ];

        expect(OrderDomainHelper.calculateOrderPaymentAmountFromCustomer(placedItems, customer)).toBe(205000);
        expect(OrderDomainHelper.calculateOrderPaymentAmountFromCustomer(placedItems, customer, true)).toBe(180000);
        expect(OrderDomainHelper.getAutoCODAmount(ORDER_PAYMENT_METHOD.BANK_TRANSFER_IN_ADVANCE, 205000)).toBe(0);
        expect(OrderDomainHelper.getAutoCODAmount(ORDER_PAYMENT_METHOD.CASH_COD, 205000)).toBe(205000);
    });

    it("returns Trello label keys for customer and order priority state", () => {
        const customer = buildCustomer({isVIP: true, buyCount: 3});
        const order = buildOrder({
            priorityStatus: ORDER_PRIORITY_STATUS.URGENT,
            paymentMethod: ORDER_PAYMENT_METHOD.BANK_TRANSFER_IN_ADVANCE
        });

        expect(OrderDomainHelper.getOrderTrelloLabelKeys(order, customer)).toEqual([
            ORDER_TRELLO_LABEL_KEYS.VIP,
            ORDER_TRELLO_LABEL_KEYS.URGENT,
            ORDER_TRELLO_LABEL_KEYS.BANK_TRANSFER_IN_ADVANCE,
            ORDER_TRELLO_LABEL_KEYS.CUSTOMER_RETURN_LESS_THAN_4
        ]);
    });

    it("evaluates status action eligibility", () => {
        const placed = buildOrder({status: ORDER_STATUS.PLACED, isPayCOD: false});
        const shipped = buildOrder({status: ORDER_STATUS.SHIPPED, isPayCOD: true});
        const waiting = buildOrder({status: ORDER_STATUS.WAITING_FOR_RETURNED});
        const returned = buildOrder({status: ORDER_STATUS.RETURNED});

        expect(OrderDomainHelper.canMarkAsWaitingForReturn(placed)).toBe(true);
        expect(OrderDomainHelper.canMarkAsWaitingForReturn(waiting)).toBe(false);
        expect(OrderDomainHelper.canMarkAsWaitingForReturn(shipped)).toBe(false);
        expect(OrderDomainHelper.canMarkAsReturned(placed)).toBe(true);
        expect(OrderDomainHelper.canMarkAsReturned(returned)).toBe(false);
        expect(OrderDomainHelper.canMarkAsReturned(shipped)).toBe(false);
        expect(OrderDomainHelper.canMarkAsShipped(placed)).toBe(true);
        expect(OrderDomainHelper.canMarkAsShipped(shipped)).toBe(false);
        expect(OrderDomainHelper.canMarkAsPayCOD(placed)).toBe(true);
        expect(OrderDomainHelper.canMarkAsPayCOD(shipped)).toBe(false);
    });
});

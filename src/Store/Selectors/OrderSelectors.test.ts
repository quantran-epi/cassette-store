import {ORDER_PAYMENT_METHOD, ORDER_PRIORITY_STATUS, ORDER_RETURN_REASON, ORDER_SHIPPING_PARTNER, ORDER_STATUS} from "@common/Constants/AppConstants";
import type {Customer} from "@store/Models/Customer";
import type {Order} from "@store/Models/Order";
import {DEFAULT_ORDER_LIST_QUERY, OrderListQuery} from "@common/Helpers/OrderListQueryHelper";
import {buildOrderListReadModel} from "./OrderSelectors";

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
    note: "fragile note",
    isFreeShip: false,
    isPayCOD: false,
    important: "call before ship",
    ...overrides
});

const customers: Customer[] = [
    buildCustomer(),
    buildCustomer({
        id: "customer-2",
        name: "Bob Tran",
        province: "Hà Nội",
        address: "99 Old Quarter",
        mobile: "0919999000",
        buyCount: 4,
        isVIP: true
    })
];

const orders: Order[] = [
    buildOrder({
        id: "paid-cod",
        name: "Alice paid COD",
        shippingCode: "VN-PAID",
        customerId: "customer-1",
        trelloCardId: "trello-paid",
        isPayCOD: true,
        paymentAmount: 150000,
        codAmount: 150000,
        shippingCost: 20000,
        createdDate: "2026-06-16T08:00:00.000Z",
        priorityMark: 7,
        note: "blue tape",
        important: "urgent gift"
    }),
    buildOrder({
        id: "unpaid-cod",
        name: "Bob unpaid COD",
        shippingCode: "VN-UNPAID",
        customerId: "customer-2",
        trelloCardId: "trello-unpaid",
        isPayCOD: false,
        paymentAmount: 240000,
        codAmount: 240000,
        shippingCost: 30000,
        createdDate: "2026-06-14T08:00:00.000Z",
        priorityMark: 20,
        status: ORDER_STATUS.SHIPPED,
        note: "contains maxell"
    }),
    buildOrder({
        id: "non-cod-missing-code",
        name: "Transfer missing code",
        shippingCode: "",
        customerId: "customer-1",
        trelloCardId: "trello-transfer",
        paymentMethod: ORDER_PAYMENT_METHOD.BANK_TRANSFER_IN_ADVANCE,
        isPayCOD: false,
        paymentAmount: 300000,
        codAmount: 0,
        shippingCost: 25000,
        createdDate: "2026-06-13T08:00:00.000Z",
        priorityMark: 2,
        status: ORDER_STATUS.CREATE_DELIVERY,
        important: "bank paid"
    }),
    buildOrder({
        id: "returned-order",
        name: "Returned order",
        shippingCode: "VN-RETURN",
        customerId: "customer-2",
        trelloCardId: "trello-return",
        status: ORDER_STATUS.RETURNED,
        returnReason: ORDER_RETURN_REASON.REFUSE_TO_RECEIVE,
        paymentAmount: 90000,
        codAmount: 90000,
        shippingCost: 18000,
        createdDate: "2026-06-10T08:00:00.000Z",
        priorityMark: 1
    })
];

const readModel = (query: Partial<OrderListQuery>) => buildOrderListReadModel({
    orders,
    customers,
    doneOrders: ["trello-paid"],
    query: {...DEFAULT_ORDER_LIST_QUERY, ...query}
});

describe("OrderSelectors", () => {
    it("searches across order and customer fields", () => {
        expect(readModel({text: "Alice paid"}).orders.map(order => order.id)).toEqual(["paid-cod"]);
        expect(readModel({text: "VN-UNPAID"}).orders.map(order => order.id)).toEqual(["unpaid-cod"]);
        expect(readModel({text: "Bob Tran"}).orders.map(order => order.id)).toEqual(["unpaid-cod", "returned-order"]);
        expect(readModel({text: "0919999000"}).orders.map(order => order.id)).toEqual(["unpaid-cod", "returned-order"]);
        expect(readModel({text: "Old Quarter"}).orders.map(order => order.id)).toEqual(["unpaid-cod", "returned-order"]);
        expect(readModel({text: "Hà Nội"}).orders.map(order => order.id)).toEqual(["unpaid-cod", "returned-order"]);
        expect(readModel({text: "blue tape"}).orders.map(order => order.id)).toEqual(["paid-cod"]);
        expect(readModel({text: "bank paid"}).orders.map(order => order.id)).toEqual(["non-cod-missing-code"]);
    });

    it("filters by status, COD state, shipping state, and date range", () => {
        expect(readModel({statuses: [ORDER_STATUS.SHIPPED]}).orders.map(order => order.id)).toEqual(["paid-cod", "unpaid-cod"]);
        expect(readModel({codState: "paid"}).orders.map(order => order.id)).toEqual(["paid-cod"]);
        expect(readModel({codState: "unpaid"}).orders.map(order => order.id)).toEqual(["unpaid-cod", "returned-order"]);
        expect(readModel({codState: "non-cod"}).orders.map(order => order.id)).toEqual(["non-cod-missing-code"]);
        expect(readModel({shippingState: "has-code"}).orders.map(order => order.id)).toEqual(["paid-cod", "unpaid-cod", "returned-order"]);
        expect(readModel({shippingState: "missing-code"}).orders.map(order => order.id)).toEqual(["non-cod-missing-code"]);
        expect(readModel({shippingState: "done-order"}).orders.map(order => order.id)).toEqual(["paid-cod"]);
        expect(readModel({dateFrom: "2026-06-14", dateTo: "2026-06-15"}).orders.map(order => order.id)).toEqual(["unpaid-cod"]);
    });

    it("sorts by newest, oldest, priority, amount, and COD amount", () => {
        expect(readModel({sort: "newest"}).orders.map(order => order.id)).toEqual(["paid-cod", "unpaid-cod", "non-cod-missing-code", "returned-order"]);
        expect(readModel({sort: "oldest"}).orders.map(order => order.id)).toEqual(["returned-order", "non-cod-missing-code", "unpaid-cod", "paid-cod"]);
        expect(readModel({sort: "priority"}).orders.map(order => order.id).slice(0, 2)).toEqual(["unpaid-cod", "paid-cod"]);
        expect(readModel({sort: "amount"}).orders.map(order => order.id).slice(0, 2)).toEqual(["non-cod-missing-code", "unpaid-cod"]);
        expect(readModel({sort: "cod"}).orders.map(order => order.id).slice(0, 2)).toEqual(["unpaid-cod", "paid-cod"]);
    });

    it("summarizes filtered result count and amounts with existing list formulas", () => {
        const model = readModel({statuses: [ORDER_STATUS.SHIPPED]});

        expect(model.summary.orderCount).toBe(2);
        expect(model.summary.cashAmount).toBe(340000);
        expect(model.summary.codReceivedAmount).toBe(340000);
        expect(model.summary.statusCounts[ORDER_STATUS.SHIPPED]).toBe(2);
    });

    it("returns selector paging fields from URL query values", () => {
        const model = readModel({sort: "oldest", page: 2, pageSize: 2});

        expect(model.allFilteredRows.map(order => order.id)).toEqual(["returned-order", "non-cod-missing-code", "unpaid-cod", "paid-cod"]);
        expect(model.pageRows.map(order => order.id)).toEqual(["unpaid-cod", "paid-cod"]);
        expect(model.page).toBe(2);
        expect(model.pageSize).toBe(2);
        expect(model.totalPages).toBe(2);
    });
});

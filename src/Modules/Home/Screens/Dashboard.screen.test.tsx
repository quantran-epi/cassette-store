import React from "react";
import {render, screen, within} from "@testing-library/react";
import {ORDER_PAYMENT_METHOD, ORDER_PRIORITY_STATUS, ORDER_RETURN_REASON, ORDER_SHIPPING_PARTNER, ORDER_STATUS} from "@common/Constants/AppConstants";
import type {Customer} from "@store/Models/Customer";
import type {Order} from "@store/Models/Order";
import {DashboardScreen} from "./Dashboard.screen";

let mockState: any;

jest.mock("@hooks", () => ({
    useScreenTitle: jest.fn()
}));

jest.mock("react-redux", () => ({
    useSelector: (selector: (state: any) => unknown) => selector(mockState)
}));

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

beforeEach(() => {
    Object.defineProperty(window, "matchMedia", {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
            matches: false,
            media: query,
            onchange: null,
            addListener: jest.fn(),
            removeListener: jest.fn(),
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            dispatchEvent: jest.fn(),
        })),
    });

    mockState = {
        order: {
            orders: [
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
            ]
        },
        customer: {
            customers: [
                buildCustomer({id: "customer-1", name: "Alice", buyCount: 2}),
                buildCustomer({id: "customer-2", name: "Bob", buyCount: 4, isVIP: true}),
                buildCustomer({id: "customer-3", name: "Carol", buyCount: 0, isInBlacklist: true})
            ]
        }
    };
});

it("renders selector-backed decision groups with Vietnamese operator labels", () => {
    render(<DashboardScreen/>);

    const codGroup = screen.getByTestId("dashboard-group-codToReconcile");
    expect(within(codGroup).getByText("COD cần đối soát")).toBeInTheDocument();
    expect(within(codGroup).getByText("190,000 đ")).toBeInTheDocument();
    expect(within(codGroup).getByText("72,000 đ")).toBeInTheDocument();

    const shippingGroup = screen.getByTestId("dashboard-group-shippingAttention");
    expect(within(shippingGroup).getByText("Cần xử lý giao hàng")).toBeInTheDocument();
    expect(within(shippingGroup).getByText("Đơn COD")).toBeInTheDocument();
    expect(within(shippingGroup).getByText("3")).toBeInTheDocument();
    expect(within(shippingGroup).getByText("Tổng đơn")).toBeInTheDocument();
    expect(within(shippingGroup).getByText("4")).toBeInTheDocument();

    const cashGroup = screen.getByTestId("dashboard-group-cashHealth");
    expect(within(cashGroup).getByText("Dòng tiền")).toBeInTheDocument();
    expect(within(cashGroup).getByText("180,000 đ")).toBeInTheDocument();
    expect(within(cashGroup).getByText("127,000 đ")).toBeInTheDocument();

    const customerGroup = screen.getByTestId("dashboard-group-customerFollowUp");
    expect(within(customerGroup).getByText("Khách hàng cần theo dõi")).toBeInTheDocument();
    expect(within(customerGroup).getByText("VIP")).toBeInTheDocument();
    expect(within(customerGroup).getByText("Bom")).toBeInTheDocument();

    const returnGroup = screen.getByTestId("dashboard-group-returnAttention");
    expect(within(returnGroup).getByText("Đơn hoàn/bom")).toBeInTheDocument();
    expect(within(returnGroup).getByText("18,000 đ")).toBeInTheDocument();

    expect(screen.getByText("Bob-TP. Hồ Chí Minh")).toBeInTheDocument();
    expect(screen.getByText("400,000 đ")).toBeInTheDocument();
});

import React from "react";
import {render, screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

it("renders selector-backed Ant Design dashboard tabs with Vietnamese operator labels", () => {
    render(<DashboardScreen/>);

    expect(screen.getByRole("tab", {name: "Tổng"})).toBeInTheDocument();
    expect(screen.getByRole("tab", {name: "COD"})).toBeInTheDocument();
    expect(screen.getByRole("tab", {name: "Khách hàng"})).toBeInTheDocument();
    expect(screen.getByText("Tổng tiền")).toBeInTheDocument();
    expect(screen.getByText("Tổng tiền chuyển khoản")).toBeInTheDocument();
    expect(screen.getByText("Tổng tiền COD")).toBeInTheDocument();

    userEvent.click(screen.getByRole("tab", {name: "COD"}));

    expect(screen.getByText("Số đơn COD")).toBeInTheDocument();
    expect(screen.getByText("Tổng tiền COD nhận về (trừ ship)")).toBeInTheDocument();
    expect(screen.getByText("COD chưa trả (đã giao thành công)")).toBeInTheDocument();

    userEvent.click(screen.getByRole("tab", {name: "Khách hàng"}));

    expect(screen.getByText("Khách mua lại")).toBeInTheDocument();
    expect(screen.getByText("VIP")).toBeInTheDocument();
    expect(screen.getAllByText("Bom").length).toBeGreaterThan(1);

    expect(screen.getAllByText(/Bob-TP\. Hồ Chí Minh/).length).toBeGreaterThan(1);
    expect(screen.getByText("400,000 đ")).toBeInTheDocument();
});

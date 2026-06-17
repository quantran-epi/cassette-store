import React from "react";
import {render, screen} from "@testing-library/react";
import {Provider} from "react-redux";
import {MemoryRouter, useLocation} from "react-router-dom";
import {configureStore} from "@reduxjs/toolkit";
import {OrderListScreen} from "./OrderList.screen";
import orderReducer from "@store/Reducers/OrderReducer";
import customerReducer from "@store/Reducers/CustomerReducer";
import type {Order} from "@store/Models/Order";
import type {Customer} from "@store/Models/Customer";
import {
    ORDER_PAYMENT_METHOD,
    ORDER_PRIORITY_STATUS,
    ORDER_SHIPPING_PARTNER,
    ORDER_STATUS
} from "@common/Constants/AppConstants";

jest.mock("@hooks", () => ({
    useScreenTitle: jest.fn()
}));

jest.mock("nanoid", () => ({
    nanoid: () => "test-id"
}));

jest.mock("./OrderItem/OrderItem.widget", () => ({
    OrderItemWidget: ({item}: {item: Order}) => <div data-testid="order-row">{item.name}</div>
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
    name: "Alice unpaid COD",
    placedItems: [],
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
    ...overrides
});

const LocationProbe = () => {
    const location = useLocation();
    return <div data-testid="location-search">{location.search}</div>;
}

const mockMatchMedia = () => {
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
}

const renderOrderList = (initialEntry: string) => {
    const store = configureStore({
        reducer: {
            order: orderReducer,
            customer: customerReducer
        },
        preloadedState: {
            order: {
                orders: [
                    buildOrder(),
                    buildOrder({
                        id: "paid-cod",
                        name: "Alice paid COD",
                        shippingCode: "VN002",
                        isPayCOD: true,
                        createdDate: "2026-06-16T08:00:00.000Z"
                    }),
                    buildOrder({
                        id: "bob-order",
                        name: "Bob transfer",
                        customerId: "customer-2",
                        paymentMethod: ORDER_PAYMENT_METHOD.BANK_TRANSFER_IN_ADVANCE,
                        codAmount: 0,
                        shippingCode: "",
                        isPayCOD: false,
                        status: ORDER_STATUS.CREATE_DELIVERY
                    })
                ],
                lastSequence: 3,
                doneOrders: ["trello-1"],
                codPayments: [],
                syncFailures: []
            },
            customer: {
                customers: [
                    buildCustomer(),
                    buildCustomer({id: "customer-2", name: "Bob Tran", mobile: "0919999000"})
                ]
            }
        } as any
    });

    return render(<Provider store={store}>
        <MemoryRouter initialEntries={[initialEntry]}>
            <OrderListScreen/>
            <LocationProbe/>
        </MemoryRouter>
    </Provider>);
}

it("uses initial URL params for visible controls and filtered rows", () => {
    mockMatchMedia();
    renderOrderList("/order/list?q=alice&status=SHIPPED&cod=unpaid&ship=has-code&sort=cod&page=1");

    expect(screen.getByLabelText("Search orders")).toHaveValue("alice");
    expect(screen.getByRole("checkbox", {name: /Thành công/i})).toBeChecked();
    expect(screen.getByText("COD: Unpaid")).toBeInTheDocument();
    expect(screen.getByText("Shipping: Has code")).toBeInTheDocument();
    expect(screen.getByText("Sort: COD amount")).toBeInTheDocument();
    expect(screen.getByText("Alice unpaid COD")).toBeInTheDocument();
    expect(screen.queryByText("Alice paid COD")).not.toBeInTheDocument();
    expect(screen.queryByText("Bob transfer")).not.toBeInTheDocument();
});

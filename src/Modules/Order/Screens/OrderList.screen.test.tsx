import React from "react";
import {render, screen, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {Provider} from "react-redux";
import {MemoryRouter, useLocation} from "react-router-dom";
import {combineReducers, configureStore} from "@reduxjs/toolkit";
import {OrderListScreen} from "./OrderList.screen";
import orderReducer from "@store/Reducers/OrderReducer";
import customerReducer from "@store/Reducers/CustomerReducer";
import appContextReducer from "@store/Reducers/AppContextReducer";
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

const defaultOrders = (): Order[] => [
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
];

const renderOrderList = (initialEntry: string, options: {orders?: Order[]} = {}) => {
    const store = configureStore({
        reducer: combineReducers({
            appContext: appContextReducer,
            order: orderReducer,
            customer: customerReducer
        }),
        preloadedState: {
            appContext: {
                loading: false,
                currentFeatureName: "",
                codImportIssueCount: 0,
                lastCodImportIssueText: ""
            },
            order: {
                orders: options.orders || defaultOrders(),
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

it("uses initial URL params for visible controls and filtered rows", async () => {
    mockMatchMedia();
    renderOrderList("/order/list?q=alice&status=SHIPPED&cod=unpaid&ship=has-code&sort=cod&page=1");

    expect(screen.getByLabelText("Tìm đơn hàng")).toHaveValue("alice");
    expect(screen.getByRole("button", {name: /Mở bộ lọc/i})).toHaveTextContent("Bộ lọc (5)");
    expect(screen.getByText("COD: Chưa trả COD")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", {name: /Mở bộ lọc/i}));

    expect(await screen.findByRole("checkbox", {name: /Thành công/i})).toBeChecked();
    expect(screen.getByText("Có mã")).toBeInTheDocument();
    expect(screen.getByText("Tiền COD")).toBeInTheDocument();
    expect(screen.getByTestId("location-search")).toHaveTextContent("cod=unpaid");
    expect(screen.getByTestId("location-search")).toHaveTextContent("ship=has-code");
    expect(screen.getByTestId("location-search")).toHaveTextContent("sort=cod");
    expect(screen.getByText("Alice unpaid COD")).toBeInTheDocument();
    expect(screen.queryByText("Alice paid COD")).not.toBeInTheDocument();
    expect(screen.queryByText("Bob transfer")).not.toBeInTheDocument();
});

it("updates URL search params when the search filter changes", async () => {
    mockMatchMedia();
    renderOrderList("/order/list");

    await userEvent.type(screen.getByLabelText("Tìm đơn hàng"), "bob");

    await waitFor(() => expect(screen.getByTestId("location-search")).toHaveTextContent("?q=bob"));
    expect(screen.getByText("Bob transfer")).toBeInTheDocument();
    expect(screen.queryByText("Alice unpaid COD")).not.toBeInTheDocument();
});

it("clears all active filters back to the default query", async () => {
    mockMatchMedia();
    renderOrderList("/order/list?q=alice&cod=unpaid&ship=has-code&sort=cod");

    await userEvent.click(screen.getByRole("button", {name: /Xóa bộ lọc/i}));

    await waitFor(() => expect(screen.getByTestId("location-search")).toHaveTextContent(""));
    expect(screen.getByText("Alice unpaid COD")).toBeInTheDocument();
    expect(screen.getByText("Alice paid COD")).toBeInTheDocument();
    expect(screen.getByText("Bob transfer")).toBeInTheDocument();
});

it("distinguishes filtered-empty state from no orders at all", () => {
    mockMatchMedia();
    const {unmount} = renderOrderList("/order/list?q=no-match");

    expect(screen.getByText("Không có đơn hàng phù hợp")).toBeInTheDocument();
    expect(screen.getByText("Xóa bộ lọc hoặc đổi tìm kiếm để xem lại danh sách đơn hàng.")).toBeInTheDocument();

    unmount();
    renderOrderList("/order/list", {orders: []});

    expect(screen.getByText("Chưa có đơn hàng nào")).toBeInTheDocument();
    expect(screen.queryByText("Không có đơn hàng phù hợp")).not.toBeInTheDocument();
});

it("sanitizes invalid query params back to default controls", async () => {
    mockMatchMedia();
    renderOrderList("/order/list?cod=bad&ship=bad&sort=bad&page=-9");

    expect(screen.getByRole("button", {name: /Mở bộ lọc/i})).toHaveTextContent("Bộ lọc");
    await userEvent.click(screen.getByRole("button", {name: /Mở bộ lọc/i}));

    expect(await screen.findByText("Tất cả COD")).toBeInTheDocument();
    expect(screen.getByText("Tất cả vận đơn")).toBeInTheDocument();
    expect(screen.getByText("Mới nhất")).toBeInTheDocument();
});

it("writes page changes to the URL", async () => {
    mockMatchMedia();
    const orders = Array.from({length: 12}).map((_, index) => buildOrder({
        id: `order-${index + 1}`,
        name: `Order ${index + 1}`,
        shippingCode: `VN${index + 1}`,
        createdDate: `2026-06-${String(index + 1).padStart(2, "0")}T08:00:00.000Z`
    }));
    renderOrderList("/order/list", {orders});

    await userEvent.click(screen.getByTitle("2"));

    await waitFor(() => expect(screen.getByTestId("location-search")).toHaveTextContent("?page=2"));
});

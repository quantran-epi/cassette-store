import React from "react";
import {act, render, screen, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {Provider} from "react-redux";
import {MemoryRouter} from "react-router-dom";
import {configureStore} from "@reduxjs/toolkit";
import {setCustomerState} from "@store/Reducers/CustomerReducer";
import {setOrderState} from "@store/Reducers/OrderReducer";
import CustomerReducer from "@store/Reducers/CustomerReducer";
import OrderReducer from "@store/Reducers/OrderReducer";
import AppContextReducer from "@store/Reducers/AppContextReducer";
import type {Customer} from "@store/Models/Customer";
import {OrderCreateScreen} from "./OrderCreate.screen";
import {
    ORDER_DEFAULT_SHIPPING_COST,
    ORDER_PAYMENT_METHOD,
    ORDER_PRIORITY_STATUS,
    ORDER_SHIPPING_PARTNER
} from "@common/Constants/AppConstants";

const mockCreateOrder = jest.fn();
const mockCalculateOrderPaymentAmount = jest.fn(() => 120000);
const mockGetAutoCODAmount = jest.fn((paymentMethod: string, paymentAmount: number) => paymentAmount);
const mockNavigate = jest.fn();
const mockMessage = {
    error: jest.fn(),
    success: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
    loading: jest.fn()
};
let testStore: ReturnType<typeof configureStore>;

jest.mock("idb-keyval", () => ({
    get: jest.fn(() => Promise.resolve(null)),
    set: jest.fn(() => Promise.resolve()),
    del: jest.fn(() => Promise.resolve())
}));

jest.mock("nanoid", () => ({
    nanoid: () => "test-id"
}));

jest.mock("@components/Message", () => ({
    useMessage: () => mockMessage
}));

jest.mock("@components/Modal/ModalProvider", () => ({
    useModal: () => ({confirm: jest.fn()})
}));

jest.mock("@hooks", () => ({
    useToggle: jest.requireActual("@hooks/useToggle").useToggle,
    getOrderWorkflowMessage: jest.requireActual("@hooks/OrderWorkflowResult").getOrderWorkflowMessage,
    hasOrderWorkflowSyncFailures: jest.requireActual("@hooks/OrderWorkflowResult").hasOrderWorkflowSyncFailures,
    useScreenTitle: () => ({}),
    useOrder: () => ({
        createOrder: mockCreateOrder,
        calculateOrderPaymentAmount: mockCalculateOrderPaymentAmount,
        getAutoCODAmount: mockGetAutoCODAmount
    })
}));

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: () => mockNavigate
}));

const buildCustomer = (overrides: Partial<Customer> = {}): Customer => ({
    id: "customer-1",
    name: "Linh Nguyen",
    province: "TP. Hồ Chí Minh",
    area: "Miền nam",
    address: "123 Test Street",
    mobile: "0900000000",
    buyCount: 0,
    buyAmount: 0,
    isVIP: false,
    isInBlacklist: false,
    difficulty: "Dễ",
    note: "",
    ...overrides
});

const renderCreateScreen = (initialEntry: any = "/order/create") => {
    return render(<Provider store={testStore}>
        <MemoryRouter initialEntries={[initialEntry]}>
            <OrderCreateScreen/>
        </MemoryRouter>
    </Provider>);
}

const waitForOrderDefaults = async () => {
    await waitFor(() => expect(mockGetAutoCODAmount).toHaveBeenCalledWith(ORDER_PAYMENT_METHOD.CASH_COD, 120000));
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

beforeEach(() => {
    mockMatchMedia();
    URL.createObjectURL = jest.fn(() => "blob:test-preview");
    URL.revokeObjectURL = jest.fn();
    testStore = configureStore({
        reducer: {
            appContext: AppContextReducer,
            customer: CustomerReducer,
            order: OrderReducer,
        }
    });
    mockCreateOrder.mockResolvedValue({
        ok: true,
        operation: "create-order",
        localUpdated: true,
        syncFailures: [],
        message: "Tạo đơn hàng thành công"
    });
    mockCalculateOrderPaymentAmount.mockReset();
    mockCalculateOrderPaymentAmount.mockReturnValue(120000);
    mockGetAutoCODAmount.mockReset();
    mockGetAutoCODAmount.mockImplementation((paymentMethod: string, paymentAmount: number) => paymentAmount);
    mockNavigate.mockClear();
    Object.values(mockMessage).forEach(mock => mock.mockClear());
    testStore.dispatch(setCustomerState({customers: [buildCustomer()]}));
    testStore.dispatch(setOrderState({
        orders: [],
        lastSequence: 0,
        doneOrders: [],
        codPayments: [],
        syncFailures: []
    }));
});

afterEach(() => {
    jest.clearAllMocks();
});

it("starts direct /order/create on customer phone lookup", () => {
    renderCreateScreen();

    expect(screen.getByPlaceholderText("Nhập số điện thoại")).toBeInTheDocument();
    expect(screen.queryByRole("button", {name: /Lưu đơn hàng/i})).not.toBeInTheDocument();
});

it("selects an existing customer and reveals the selected summary with the order form", async () => {
    renderCreateScreen();

    await userEvent.type(screen.getByPlaceholderText("Nhập số điện thoại"), "0900");
    await userEvent.click(screen.getByRole("button", {name: /search/i}));
    await userEvent.click(await screen.findByRole("button", {name: /Tạo đơn/i}));

    expect(await screen.findByTestId("selected-customer-summary")).toBeInTheDocument();
    expect(screen.getByText("Linh Nguyen")).toBeInTheDocument();
    expect(screen.getByRole("button", {name: /Đổi khách/i})).toBeInTheDocument();
    expect(screen.getByRole("button", {name: /Lưu đơn hàng/i})).toBeInTheDocument();
});

it("adds a new customer inline and continues to the order form", async () => {
    renderCreateScreen();

    await userEvent.type(screen.getByPlaceholderText("Nhập số điện thoại"), "0911111111");
    await userEvent.click(screen.getByRole("button", {name: /search/i}));
    await userEvent.click(await screen.findByRole("button", {name: /Tạo đơn khách mới/i}));

    await userEvent.type(await screen.findByPlaceholderText("Nhập tên"), "New Customer");
    await userEvent.type(screen.getByPlaceholderText("Nhập địa chỉ"), "456 New Street");

    await act(async () => {
        await userEvent.click(screen.getByRole("button", {name: /^Lưu$/i}));
    });

    expect(await screen.findByTestId("selected-customer-summary")).toBeInTheDocument();
    expect(screen.getByText("New Customer")).toBeInTheDocument();
    expect(screen.getByRole("button", {name: /Lưu đơn hàng/i})).toBeInTheDocument();
});

it("preselects a route-state customer and skips lookup", async () => {
    renderCreateScreen({pathname: "/order/create", state: {customerId: "customer-1"}});

    expect(await screen.findByTestId("selected-customer-summary")).toBeInTheDocument();
    expect(screen.getByText("Linh Nguyen")).toBeInTheDocument();
    expect(screen.queryByPlaceholderText("Nhập số điện thoại")).not.toBeInTheDocument();
    expect(screen.getByRole("button", {name: /Lưu đơn hàng/i})).toBeInTheDocument();
});

it("submits default create values through useOrder.createOrder", async () => {
    renderCreateScreen({pathname: "/order/create", state: {customerId: "customer-1"}});

    await waitForOrderDefaults();
    await userEvent.click(await screen.findByRole("button", {name: /Lưu đơn hàng/i}));

    await waitFor(() => expect(mockCreateOrder).toHaveBeenCalled());
    const [order, customer, files] = mockCreateOrder.mock.calls[0];

    expect(order).toEqual(expect.objectContaining({
        customerId: "customer-1",
        priorityStatus: ORDER_PRIORITY_STATUS.NONE,
        isFreeShip: false,
        shippingPartner: ORDER_SHIPPING_PARTNER.VNPOST,
        paymentMethod: ORDER_PAYMENT_METHOD.CASH_COD,
        shippingCost: ORDER_DEFAULT_SHIPPING_COST,
        paymentAmount: 120000,
        codAmount: 120000,
        important: "",
    }));
    expect(order).toHaveProperty("dueDate");
    expect(order.dueDate).toBeUndefined();
    expect(order.placedItems.length).toBeGreaterThan(0);
    expect(customer).toEqual(expect.objectContaining({id: "customer-1"}));
    expect(files).toEqual([]);
});

it("shows changed values in the collapsed details summary", async () => {
    renderCreateScreen({pathname: "/order/create", state: {customerId: "customer-1"}});

    expect(await screen.findByText("Thông tin thêm")).toBeInTheDocument();
    expect(screen.getByText("Mặc định")).toBeInTheDocument();

    await userEvent.click(screen.getByText("Thông tin thêm"));
    await userEvent.click(screen.getByLabelText("Miễn phí vận chuyển"));

    expect(screen.getByText("Đã đổi:")).toBeInTheDocument();
    expect(screen.getAllByText("Miễn phí vận chuyển").length).toBeGreaterThan(1);
});

it("passes attachments to createOrder and warns when Trello sync fails after local save", async () => {
    mockCreateOrder.mockResolvedValueOnce({
        ok: true,
        operation: "create-order",
        localUpdated: true,
        syncFailures: [{id: "failure-1", orderId: "order-1", operation: "create-card", status: "failed", message: "Trello failed", retryable: true}],
        message: "Tạo đơn hàng thành công"
    });
    const {container} = renderCreateScreen({pathname: "/order/create", state: {customerId: "customer-1"}});
    const file = new File(["cover"], "cover.jpg", {type: "image/jpeg"});
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;

    await waitForOrderDefaults();
    await userEvent.upload(fileInput, file);
    await userEvent.click(await screen.findByRole("button", {name: /Lưu đơn hàng/i}));

    await waitFor(() => expect(mockCreateOrder).toHaveBeenCalled());
    expect(mockCreateOrder.mock.calls[0][2]).toEqual([file]);
    await waitFor(() => expect(mockMessage.warning).toHaveBeenCalledWith("Tạo đơn hàng thành công. Cần đồng bộ lại Trello."));
    expect(mockNavigate).toHaveBeenCalledWith("/order/list");
});

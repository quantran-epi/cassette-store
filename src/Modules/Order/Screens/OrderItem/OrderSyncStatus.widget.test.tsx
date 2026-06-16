import React from "react";
import {act, render, screen, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {Provider} from "react-redux";
import {OrderSyncStatusWidget} from "./OrderSyncStatus.widget";
import {OrderItemWidget} from "./OrderItem.widget";
import {store} from "@store/Store";
import {setOrderState} from "@store/Reducers/OrderReducer";
import {setCustomerState} from "@store/Reducers/CustomerReducer";
import type {OrderSyncFailure} from "@store/Models/OrderSyncFailure";
import type {Order} from "@store/Models/Order";
import type {Customer} from "@store/Models/Customer";
import {
    ORDER_PAYMENT_METHOD,
    ORDER_PRIORITY_STATUS,
    ORDER_SHIPPING_PARTNER,
    ORDER_STATUS
} from "@common/Constants/AppConstants";

const mockRetryOrderSyncFailure = jest.fn();
const mockClearOrderSyncFailure = jest.fn();
const mockMessage = {
    error: jest.fn(),
    success: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
    loading: jest.fn()
};

jest.mock("idb-keyval", () => ({
    get: jest.fn(() => Promise.resolve(null)),
    set: jest.fn(() => Promise.resolve()),
    del: jest.fn(() => Promise.resolve())
}));

jest.mock("nanoid", () => ({
    nanoid: () => "test-id"
}));

jest.mock("@hooks", () => ({
    useToggle: jest.requireActual("@hooks/useToggle").useToggle,
    getOrderWorkflowMessage: jest.requireActual("@hooks/OrderWorkflowResult").getOrderWorkflowMessage,
    hasOrderWorkflowSyncFailures: jest.requireActual("@hooks/OrderWorkflowResult").hasOrderWorkflowSyncFailures,
    useTrello: () => ({}),
    useOrder: () => ({
        retryOrderSyncFailure: mockRetryOrderSyncFailure,
        clearOrderSyncFailure: mockClearOrderSyncFailure,
        canMarkAsShipped: () => true,
        canMarkAsPayCOD: () => true,
        isRefuseToReceive: () => false,
        isBrokenItems: () => false,
        canMarkAsWaitingForReturn: () => true,
        canMarkAsReturned: () => true,
        isPushedTrello: () => true,
        markOrderAsShipped: jest.fn(),
        markOrderAsPayCOD: jest.fn(),
        markOrderAsRefuseToReceive: jest.fn(),
        markOrderAsWaitingForReturn: jest.fn(),
        markOrderAsReturned: jest.fn(),
        markOrderAsBrokenItems: jest.fn(),
        changeShippingCode: jest.fn()
    })
}));

jest.mock("@components/Message", () => ({
    useMessage: () => mockMessage
}));

jest.mock("@components/Modal/ModalProvider", () => ({
    useModal: () => ({confirm: jest.fn()})
}));

jest.mock("./OrderChangeShippingCode.widget", () => ({OrderChangeShippingCodeWidget: () => null}));
jest.mock("@modules/Order/Screens/OrderItem/OrderCreateDeliveryAssistant.widget", () => ({OrderCreateDeliveryAssistantWidget: () => null}));
jest.mock("@modules/Order/Screens/OrderItem/OrderRefund.widget", () => ({OrderRefundWidget: () => null}));
jest.mock("@modules/Order/Screens/OrderItem/OrderPlacedItems.widget", () => ({OrderPlacedItemsWidget: () => null}));
jest.mock("@modules/Order/Screens/OrderItem/OrderShippingInfo.widget", () => ({OrderShippinInfoWidget: () => null}));
jest.mock("@modules/Order/Screens/OrderItem/OrderAttachments.widget", () => ({OrderAttachmentsWidget: () => null}));
jest.mock("./OrderPriority.widget", () => ({OrderPriorityWidget: () => null}));
jest.mock("@modules/Order/Screens/OrderItem/OrderCustomerInfo.widget", () => ({OrderCustomerInfoWidget: () => null}));

const buildSyncFailure = (overrides: Partial<OrderSyncFailure> = {}): OrderSyncFailure => ({
    id: "failure-1",
    orderId: "order-1",
    operation: "move-card",
    status: "failed",
    message: "Move failed",
    retryable: true,
    createdAt: "2026-06-16T00:00:00.000Z",
    updatedAt: "2026-06-16T00:00:00.000Z",
    trelloCardId: "trello-card-1",
    retryPayload: {orderId: "order-1", trelloCardId: "trello-card-1", idList: "done-list"},
    ...overrides
});

const buildCustomer = (overrides: Partial<Customer> = {}): Customer => ({
    id: "customer-1",
    name: "Customer One",
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

const buildOrder = (overrides: Partial<Order> = {}): Order => ({
    id: "order-1",
    sequence: 1,
    createdDate: "2026-06-16T00:00:00.000Z",
    name: "1. Customer One-TP. Hồ Chí Minh",
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
    dueDate: "2026-06-17T00:00:00.000Z" as any,
    customerId: "customer-1",
    trelloCardId: "trello-card-1",
    position: 0,
    note: "",
    isFreeShip: false,
    isPayCOD: false,
    ...overrides
});

beforeEach(() => {
    mockRetryOrderSyncFailure.mockResolvedValue({
        ok: true,
        operation: "retry-sync",
        localUpdated: true,
        syncFailures: [],
        message: "Đồng bộ Trello thành công"
    });
    mockClearOrderSyncFailure.mockClear();
    Object.values(mockMessage).forEach(mock => mock.mockClear());
    store.dispatch(setCustomerState({customers: []}));
    store.dispatch(setOrderState({
        orders: [],
        lastSequence: 0,
        doneOrders: [],
        codPayments: [],
        syncFailures: []
    }));
});

afterEach(() => {
    jest.restoreAllMocks();
});

it("renders no visible text for an empty failures array", () => {
    render(<OrderSyncStatusWidget failures={[]}/>);

    expect(screen.queryByText(/Lỗi đồng bộ Trello/i)).not.toBeInTheDocument();
});

it("renders a compact Vietnamese warning when failures exist", () => {
    render(<OrderSyncStatusWidget failures={[buildSyncFailure()]}/>);

    expect(screen.getByText("Lỗi đồng bộ Trello")).toBeInTheDocument();
    expect(screen.getByText(/Chuyển thẻ Trello: Move failed/i)).toBeInTheDocument();
});

it("clicking retry calls retryOrderSyncFailure with the selected failure ID", async () => {
    render(<OrderSyncStatusWidget failures={[buildSyncFailure()]}/>);

    await act(async () => {
        await userEvent.click(screen.getByRole("button", {name: /Thử lại/i}));
    });

    await waitFor(() => expect(mockRetryOrderSyncFailure).toHaveBeenCalledWith("failure-1"));
    await waitFor(() => expect(mockMessage.success).toHaveBeenCalledWith("Đồng bộ Trello thành công"));
});

it("clicking manual resolved calls clearOrderSyncFailure with the selected failure ID", async () => {
    render(<OrderSyncStatusWidget failures={[buildSyncFailure()]}/>);

    await userEvent.click(screen.getByRole("button", {name: /Đã xử lý/i}));

    expect(mockClearOrderSyncFailure).toHaveBeenCalledWith("failure-1");
});

it("OrderItemWidget passes only failures for the current order", () => {
    const order = buildOrder();
    store.dispatch(setCustomerState({customers: [buildCustomer()]}));
    store.dispatch(setOrderState({
        orders: [order],
        lastSequence: 1,
        doneOrders: [],
        codPayments: [],
        syncFailures: [
            buildSyncFailure({id: "visible-failure", orderId: order.id, message: "Visible failure"}),
            buildSyncFailure({id: "hidden-failure", orderId: "other-order", message: "Hidden failure"})
        ]
    }));

    render(<Provider store={store}>
        <OrderItemWidget item={order} onDelete={jest.fn()}/>
    </Provider>);

    expect(screen.getByText("Lỗi đồng bộ Trello")).toBeInTheDocument();
    expect(screen.getByText(/Visible failure/i)).toBeInTheDocument();
    expect(screen.queryByText(/Hidden failure/i)).not.toBeInTheDocument();
});

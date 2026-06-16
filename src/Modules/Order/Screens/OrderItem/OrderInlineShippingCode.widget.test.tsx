import React from "react";
import {act, render, screen, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {Provider} from "react-redux";
import {OrderItemWidget} from "./OrderItem.widget";
import {store} from "@store/Store";
import {setCustomerState} from "@store/Reducers/CustomerReducer";
import {setOrderState} from "@store/Reducers/OrderReducer";
import type {Order} from "@store/Models/Order";
import type {Customer} from "@store/Models/Customer";
import type {OrderSyncFailure} from "@store/Models/OrderSyncFailure";
import {
    ORDER_PAYMENT_METHOD,
    ORDER_PRIORITY_STATUS,
    ORDER_SHIPPING_PARTNER,
    ORDER_STATUS
} from "@common/Constants/AppConstants";

const mockChangeShippingCode = jest.fn();
const mockClipboardReadText = jest.fn();
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
        retryOrderSyncFailure: jest.fn(),
        clearOrderSyncFailure: jest.fn(),
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
        changeShippingCode: mockChangeShippingCode
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

const buildSyncFailure = (overrides: Partial<OrderSyncFailure> = {}): OrderSyncFailure => ({
    id: "failure-1",
    orderId: "order-1",
    operation: "create-comment",
    status: "failed",
    message: "Trello comment failed",
    retryable: true,
    createdAt: "2026-06-16T00:00:00.000Z",
    updatedAt: "2026-06-16T00:00:00.000Z",
    trelloCardId: "trello-card-1",
    retryPayload: {orderId: "order-1", trelloCardId: "trello-card-1", shippingCode: "SPX123"},
    ...overrides
});

const renderOrderRow = (props: {order?: Order; failures?: OrderSyncFailure[]} = {}) => {
    const order = props.order || buildOrder();

    store.dispatch(setCustomerState({customers: [buildCustomer()]}));
    store.dispatch(setOrderState({
        orders: [order],
        lastSequence: 1,
        doneOrders: [],
        codPayments: [],
        syncFailures: props.failures || []
    }));

    return render(<Provider store={store}>
        <OrderItemWidget item={order} onDelete={jest.fn()}/>
    </Provider>);
}

beforeEach(() => {
    Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: {readText: mockClipboardReadText}
    });
    mockClipboardReadText.mockResolvedValue("SPX123456");
    mockChangeShippingCode.mockResolvedValue({
        ok: true,
        operation: "change-shipping-code",
        localUpdated: true,
        syncFailures: [],
        message: "Lưu mã vận đơn thành công"
    });
    Object.values(mockMessage).forEach(mock => mock.mockClear());
});

afterEach(() => {
    jest.restoreAllMocks();
});

it("renders inline shipping-code entry for eligible rows without reading the clipboard", () => {
    renderOrderRow();

    expect(screen.getByPlaceholderText("Nhập mã vận đơn")).toBeInTheDocument();
    expect(screen.getByRole("button", {name: /Dán mã/i})).toBeInTheDocument();
    expect(screen.getByRole("button", {name: /Lưu mã/i})).toBeInTheDocument();
    expect(mockClipboardReadText).not.toHaveBeenCalled();
});

it("reads clipboard only after explicit paste and populates the shipping-code field", async () => {
    renderOrderRow();

    await userEvent.click(screen.getByRole("button", {name: /Dán mã/i}));

    expect(mockClipboardReadText).toHaveBeenCalledTimes(1);
    expect(screen.getByPlaceholderText("Nhập mã vận đơn")).toHaveValue("SPX123456");
});

it("saves through changeShippingCode and leaves row-scoped sync controls visible on Trello failure", async () => {
    mockChangeShippingCode.mockResolvedValueOnce({
        ok: true,
        operation: "change-shipping-code",
        localUpdated: true,
        syncFailures: [buildSyncFailure()],
        message: "Lưu mã vận đơn thành công"
    });
    renderOrderRow({failures: [buildSyncFailure()]});

    await userEvent.type(screen.getByPlaceholderText("Nhập mã vận đơn"), "SPX123");
    await act(async () => {
        await userEvent.click(screen.getByRole("button", {name: /Lưu mã/i}));
    });

    await waitFor(() => expect(mockChangeShippingCode).toHaveBeenCalledWith("order-1", "SPX123"));
    await waitFor(() => expect(mockMessage.warning).toHaveBeenCalledWith("Lưu mã vận đơn thành công. Cần đồng bộ lại Trello."));
    expect(screen.getByText("Lỗi đồng bộ Trello")).toBeInTheDocument();
    expect(screen.getByText(/Bình luận mã vận đơn: Trello comment failed/i)).toBeInTheDocument();
    expect(screen.getByRole("button", {name: /Thử lại/i})).toBeInTheDocument();
    expect(screen.getByRole("button", {name: /Đã xử lý/i})).toBeInTheDocument();
});

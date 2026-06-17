import React from "react";
import {render, screen, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {Provider} from "react-redux";
import {OrderCodPaymentImportWidget} from "./OrderCodPaymentImport.widget";
import {parseCodWorkbookRows} from "@common/Helpers/CodPaymentImportHelper";
import type {CodImportRawRow} from "@common/Helpers/CodPaymentImportHelper";
import type {Order} from "@store/Models/Order";
import {
    ORDER_PAYMENT_METHOD,
    ORDER_PRIORITY_STATUS,
    ORDER_SHIPPING_PARTNER,
    ORDER_STATUS
} from "@common/Constants/AppConstants";
import {store} from "@store/Store";
import {setAppContextState} from "@store/Reducers/AppContextReducer";
import {del, get, set} from "idb-keyval";

const mockConfirm = jest.fn();
const mockMessage = {
    error: jest.fn(),
    success: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
    loading: jest.fn()
};

jest.mock("@common/Helpers/CodPaymentImportHelper", () => {
    const actual = jest.requireActual("@common/Helpers/CodPaymentImportHelper");
    return {
        ...actual,
        parseCodWorkbookRows: jest.fn()
    };
});

jest.mock("idb-keyval", () => ({
    get: jest.fn(() => Promise.resolve(null)),
    set: jest.fn(() => Promise.resolve()),
    del: jest.fn(() => Promise.resolve())
}));

jest.mock("nanoid", () => ({
    nanoid: jest.fn(() => "test-id")
}));

jest.mock("@components/Message", () => ({
    useMessage: () => mockMessage
}));

jest.mock("@components/Modal/ModalProvider", () => ({
    useModal: () => ({
        confirm: mockConfirm
    })
}));

const mockParseCodWorkbookRows = parseCodWorkbookRows as jest.MockedFunction<typeof parseCodWorkbookRows>;

const buildOrder = (overrides: Partial<Order> = {}): Order => ({
    id: "order-matched",
    sequence: 1,
    createdDate: "2026-06-15T00:00:00.000Z",
    name: "Matched Order",
    placedItems: [],
    changeItems: [],
    status: ORDER_STATUS.SHIPPED,
    shippingCost: 20520,
    returnReason: "",
    isRefund: false,
    refundAmount: 0,
    paymentMethod: ORDER_PAYMENT_METHOD.CASH_COD,
    paymentAmount: 120000,
    shippingPartner: ORDER_SHIPPING_PARTNER.VNPOST,
    shippingCode: "VN001",
    codAmount: 120000,
    priorityMark: 0,
    priorityStatus: ORDER_PRIORITY_STATUS.NONE,
    dueDate: new Date("2026-06-16T00:00:00.000Z"),
    customerId: "customer-1",
    trelloCardId: "trello-card-1",
    position: 0,
    note: "",
    isFreeShip: false,
    isPayCOD: false,
    ...overrides
});

const matchedRawRows: CodImportRawRow[] = [
    {rowNumber: 2, values: {"Shipping code": "VN001", "COD amount": "120000", "Shipping fee": "", "Status": "Paid", "Paid date": "2026-06-15"}}
];

const reviewRawRows: CodImportRawRow[] = [
    ...matchedRawRows,
    {rowNumber: 3, values: {"Shipping code": "VN404", "COD amount": "90000", "Shipping fee": "", "Status": "Paid", "Paid date": "2026-06-15"}}
];

const changedFormatRawRows: CodImportRawRow[] = [
    {rowNumber: 2, values: {Tracking: "VN001", Amount: "120000", Fee: "20520"}}
];

const orders = [
    buildOrder(),
    buildOrder({id: "order-manual", name: "Manual Order", shippingCode: "VNMANUAL", codAmount: 90000})
];

const uploadCodFile = async (container: HTMLElement) => {
    const input = container.querySelector("input[type='file']") as HTMLInputElement;
    await userEvent.upload(input, new File(["cod"], "cod.xlsx", {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}));
}

const renderImportWidget = (props: React.ComponentProps<typeof OrderCodPaymentImportWidget>) => render(
    <Provider store={store}>
        <OrderCodPaymentImportWidget {...props}/>
    </Provider>
);

beforeEach(() => {
    (get as jest.Mock).mockImplementation(() => Promise.resolve(null));
    (set as jest.Mock).mockImplementation(() => Promise.resolve());
    (del as jest.Mock).mockImplementation(() => Promise.resolve());
    mockParseCodWorkbookRows.mockReset();
    mockConfirm.mockImplementation(({onOk}) => onOk?.());
    Object.values(mockMessage).forEach(mock => mock.mockClear());
    store.dispatch(setAppContextState({currentFeatureName: ""}));
});

afterEach(() => {
    jest.restoreAllMocks();
});

it("renders empty state and import controls before a file is selected", () => {
    renderImportWidget({orders});

    expect(screen.getByText("No COD file imported")).toBeInTheDocument();
    expect(screen.getAllByText("Import a COD Excel file to review matched orders before applying payment.").length).toBeGreaterThan(0);
    expect(screen.getByRole("button", {name: /Import COD Excel/i})).toBeInTheDocument();
    expect(screen.getByRole("button", {name: /Map columns manually/i})).toBeDisabled();
});

it("renders all review bucket labels after parsing a COD file", async () => {
    mockParseCodWorkbookRows.mockResolvedValue(reviewRawRows);
    const {container} = renderImportWidget({orders, onApply: jest.fn()});

    await uploadCodFile(container);

    expect(await screen.findByText(/^Matched: 1$/i)).toBeInTheDocument();
    expect(screen.getByText(/^Unmatched: 1$/i)).toBeInTheDocument();
    expect(screen.getByText(/^Duplicate: 0$/i)).toBeInTheDocument();
    expect(screen.getByText(/^Amount mismatch: 0$/i)).toBeInTheDocument();
    expect(screen.getByText(/^Already paid: 0$/i)).toBeInTheDocument();
    expect(screen.getByText("Row 2")).toBeInTheDocument();
    expect(screen.getByText("VN001")).toBeInTheDocument();
    expect(screen.getByText(/Imported COD: 120,000 đ/i)).toBeInTheDocument();
    expect(screen.getByText(/Current app COD: 120,000 đ/i)).toBeInTheDocument();
    expect(screen.getByText(/Matched order: Matched Order/i)).toBeInTheDocument();
});

it("keeps apply disabled while included unresolved rows remain", async () => {
    mockParseCodWorkbookRows.mockResolvedValue(reviewRawRows);
    const {container} = renderImportWidget({orders, onApply: jest.fn()});

    await uploadCodFile(container);

    expect(await screen.findByText("Some rows need review. Resolve or exclude them before applying.")).toBeInTheDocument();
    expect(screen.getByRole("button", {name: /Apply confirmed COD rows/i})).toBeDisabled();
    expect(store.getState().appContext.codImportIssueCount).toBe(1);
    expect(store.getState().appContext.lastCodImportIssueText).toBe("Some rows need review. Resolve or exclude them before applying.");
});

it("shows manual column mapping when detection confidence is low", async () => {
    mockParseCodWorkbookRows.mockResolvedValue(changedFormatRawRows);
    const {container} = renderImportWidget({orders, onApply: jest.fn()});

    await uploadCodFile(container);

    expect(await screen.findByText("Detected columns:")).toBeInTheDocument();
    expect(screen.getByText("Shipping code")).toBeInTheDocument();
    expect(screen.getByText("COD amount")).toBeInTheDocument();
    expect(screen.getByText("Shipping fee")).toBeInTheDocument();
});

it("confirms and sends the helper-built payload for confirmed matched rows", async () => {
    const onApply = jest.fn();
    mockParseCodWorkbookRows.mockResolvedValue(matchedRawRows);
    const {container} = renderImportWidget({orders, onApply});

    await uploadCodFile(container);

    const applyButton = await screen.findByRole("button", {name: /Apply confirmed COD rows/i});
    await waitFor(() => expect(applyButton).toBeEnabled());
    expect(onApply).not.toHaveBeenCalled();

    await userEvent.click(applyButton);

    expect(mockConfirm).toHaveBeenCalledWith(expect.objectContaining({
        title: "Apply COD payments: confirmed rows will mark matched orders as paid COD."
    }));
    await waitFor(() => expect(onApply).toHaveBeenCalledWith(expect.objectContaining({
        paymentOrderIds: ["order-matched"],
        debitFeeOrderIds: [],
        includedRowIds: ["cod-row-2"],
        blockingIssueIds: []
    })));
    expect(screen.getByText("No COD file imported")).toBeInTheDocument();
    expect(store.getState().appContext.codImportIssueCount).toBe(0);
    expect(store.getState().appContext.lastCodImportIssueText).toBe("");
});

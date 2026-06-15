import React from "react";
import {render, screen, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {Provider} from "react-redux";
import {MemoryRouter} from "react-router-dom";
import {MasterPage} from "./MasterPage";
import {store, RootState} from "@store/Store";
import {setOrderState} from "@store/Reducers/OrderReducer";
import {setCustomerState} from "@store/Reducers/CustomerReducer";
import {setAppContextState} from "@store/Reducers/AppContextReducer";
import {BACKUP_SCHEMA_VERSION, createBackupEnvelope} from "@common/Helpers/BackupHelper";

const mockCreateAttachment = jest.fn();
const mockRefreshDoneOrders = jest.fn();
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
    nanoid: jest.fn(() => "test-id")
}));

jest.mock("@hooks", () => ({
    useTheme: jest.requireActual("@hooks/useTheme").useTheme,
    useToggle: jest.requireActual("@hooks/useToggle").useToggle,
    useTrello: () => ({
        createAttachment: mockCreateAttachment
    }),
    useOrder: () => ({
        refreshDoneOrders: mockRefreshDoneOrders
    })
}));

jest.mock("@components/Message", () => ({
    useMessage: () => mockMessage
}));

const BACKUP_CARD_ID = "68498a4712a808a92bf59b01";

const restoredOrderState = {
    orders: [{id: "restored-order", sequence: 77}],
    lastSequence: 77,
    doneOrders: ["done-restored"],
    codPayments: [{
        id: "cod-restored",
        name: "COD restored",
        cycleDate: "2026-06-15T00:00:00.000Z",
        paymentOrders: ["restored-order"],
        debitFeeOrders: ["fee-order"]
    }]
} as any;

const restoredCustomerState = {
    customers: [{id: "customer-restored", name: "Restored customer"}]
} as any;

const restoredAppContextState = {
    loading: true,
    currentFeatureName: "Restored feature"
};

const legacyBackup = {
    order: restoredOrderState,
    customer: restoredCustomerState,
    appContext: restoredAppContextState
} as RootState;

const renderMasterPage = () => render(
    <Provider store={store}>
        <MemoryRouter initialEntries={["/"]}>
            <MasterPage/>
        </MemoryRouter>
    </Provider>
);

const resetStore = () => {
    store.dispatch(setOrderState({
        orders: [],
        lastSequence: 0,
        doneOrders: [],
        codPayments: []
    }));
    store.dispatch(setCustomerState({customers: []}));
    store.dispatch(setAppContextState({currentFeatureName: ""}));
}

const seedBackupState = () => {
    store.dispatch(setOrderState({
        orders: [{id: "order-before-backup", sequence: 12}] as any,
        lastSequence: 12,
        doneOrders: ["done-before-backup"],
        codPayments: [{
            id: "cod-before-backup",
            name: "COD before backup",
            cycleDate: "2026-06-15T00:00:00.000Z",
            paymentOrders: ["order-before-backup"],
            debitFeeOrders: ["fee-before-backup"]
        }]
    }));
    store.dispatch(setCustomerState({
        customers: [{id: "customer-before-backup", name: "Customer before backup"}] as any
    }));
    store.dispatch(setAppContextState({currentFeatureName: "Orders"}));
}

const readBlobText = (blob: Blob): Promise<string> => {
    if (typeof blob.text === "function") return blob.text();

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(reader.error);
        reader.readAsText(blob);
    });
}

const mockFetchText = (text: string) => {
    global.fetch = jest.fn(() => Promise.resolve({
        ok: true,
        status: 200,
        text: () => Promise.resolve(text)
    } as Response));
}

const createDeferred = <T,>() => {
    let resolve: (value: T) => void;
    let reject: (reason?: any) => void;
    const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
    });

    return {promise, resolve, reject};
}

const restoreFromDrawer = async () => {
    userEvent.click(screen.getByLabelText("Mở menu"));
    userEvent.click(await screen.findByRole("button", {name: /Đồng bộ dữ liệu đã lưu trữ/i}));
}

beforeEach(() => {
    resetStore();
    localStorage.setItem("lastCheckTime", Date.now().toString());
    mockCreateAttachment.mockResolvedValue({id: "attachment-id"});
    mockRefreshDoneOrders.mockResolvedValue(0);
    Object.values(mockMessage).forEach(mock => mock.mockClear());
    global.fetch = jest.fn(() => Promise.resolve({
        ok: true,
        status: 200,
        text: () => Promise.resolve("")
    } as Response));
});

afterEach(() => {
    jest.restoreAllMocks();
    mockCreateAttachment.mockReset();
    mockRefreshDoneOrders.mockReset();
    localStorage.clear();
});

it("uploads versioned backup envelopes to the existing Trello backup card", async () => {
    seedBackupState();
    const upload = createDeferred<{ id: string }>();
    mockCreateAttachment.mockReturnValueOnce(upload.promise);
    renderMasterPage();

    userEvent.click(screen.getByLabelText("Mở tác vụ nhanh"));
    userEvent.click(await screen.findByLabelText("Sao lưu dữ liệu"));

    await waitFor(() => expect(mockCreateAttachment).toHaveBeenCalledTimes(1));
    expect(await screen.findByText("Đang backup dữ liệu")).toBeInTheDocument();
    const [attachment, cardId] = mockCreateAttachment.mock.calls[0];
    const uploadedText = await readBlobText(attachment.file);
    const uploadedBackup = JSON.parse(uploadedText);

    expect(cardId).toBe(BACKUP_CARD_ID);
    expect(attachment.name).toContain(`v${BACKUP_SCHEMA_VERSION}`);
    expect(uploadedBackup.schemaVersion).toBe(BACKUP_SCHEMA_VERSION);
    expect(uploadedBackup.createdAt).toEqual(expect.any(String));
    expect(uploadedBackup.payload.order.doneOrders).toEqual(["done-before-backup"]);
    expect(uploadedBackup.payload.order.codPayments).toEqual([{
        id: "cod-before-backup",
        name: "COD before backup",
        cycleDate: "2026-06-15T00:00:00.000Z",
        paymentOrders: ["order-before-backup"],
        debitFeeOrders: ["fee-before-backup"]
    }]);
    upload.resolve({id: "attachment-id"});
    await waitFor(() => expect(screen.getByText(/Backup thành công/i)).toBeInTheDocument());
    expect(localStorage.getItem("lastSuccessfulBackupTime")).toBeTruthy();
});

it("shows backup failure status without updating last backup time", async () => {
    const originalLastCheck = Date.now().toString();
    const originalSuccessfulBackup = "123456789";
    localStorage.setItem("lastCheckTime", originalLastCheck);
    localStorage.setItem("lastSuccessfulBackupTime", originalSuccessfulBackup);
    mockCreateAttachment.mockRejectedValueOnce(new Error("Trello offline"));
    renderMasterPage();

    userEvent.click(screen.getByLabelText("Mở tác vụ nhanh"));
    userEvent.click(await screen.findByLabelText("Sao lưu dữ liệu"));

    await waitFor(() => expect(screen.getByText("Backup lỗi: Trello offline")).toBeInTheDocument());
    expect(localStorage.getItem("lastCheckTime")).toBe(originalLastCheck);
    expect(localStorage.getItem("lastSuccessfulBackupTime")).toBe(originalSuccessfulBackup);
});

it.each([
    ["empty backup", "", "File backup đang trống."],
    ["invalid JSON", "{", "File backup không phải JSON hợp lệ."],
    ["unsupported schema", JSON.stringify({schemaVersion: 999, payload: legacyBackup}), "Phiên bản backup không được hỗ trợ: 999"],
    ["missing order section", JSON.stringify({customer: restoredCustomerState}), "Backup thiếu dữ liệu đơn hàng."],
    ["missing customer section", JSON.stringify({order: restoredOrderState}), "Backup thiếu dữ liệu khách hàng."]
])("does not dispatch restore actions for %s", async (_label, backupText, expectedMessage) => {
    mockFetchText(backupText);
    const dispatchSpy = jest.spyOn(store, "dispatch");
    renderMasterPage();

    await restoreFromDrawer();

    await waitFor(() => expect(mockMessage.error).toHaveBeenCalledWith(expectedMessage));
    expect(await screen.findByText(expectedMessage)).toBeInTheDocument();
    expect(dispatchSpy).not.toHaveBeenCalledWith(expect.objectContaining({type: setOrderState.type}));
    expect(dispatchSpy).not.toHaveBeenCalledWith(expect.objectContaining({type: setCustomerState.type}));
    expect(dispatchSpy).not.toHaveBeenCalledWith(expect.objectContaining({type: setAppContextState.type}));
    expect(mockCreateAttachment).not.toHaveBeenCalled();
});

it("reports fetch failure before dispatching restore actions", async () => {
    global.fetch = jest.fn(() => Promise.reject(new Error("Network down")));
    const dispatchSpy = jest.spyOn(store, "dispatch");
    renderMasterPage();

    await restoreFromDrawer();

    await waitFor(() => expect(mockMessage.error).toHaveBeenCalledWith("Không thể tải file backup: Network down"));
    expect(await screen.findByText("Lỗi tải backup: Network down")).toBeInTheDocument();
    expect(dispatchSpy).not.toHaveBeenCalledWith(expect.objectContaining({type: setOrderState.type}));
    expect(dispatchSpy).not.toHaveBeenCalledWith(expect.objectContaining({type: setCustomerState.type}));
    expect(dispatchSpy).not.toHaveBeenCalledWith(expect.objectContaining({type: setAppContextState.type}));
});

it("restores legacy raw RootState backups after creating a pre-restore snapshot", async () => {
    const fetchResult = createDeferred<Response>();
    global.fetch = jest.fn(() => fetchResult.promise);
    renderMasterPage();

    await restoreFromDrawer();

    expect(await screen.findByText("Đang khôi phục dữ liệu")).toBeInTheDocument();
    fetchResult.resolve({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify(legacyBackup))
    } as Response);
    await waitFor(() => expect(store.getState().order.doneOrders).toEqual(["done-restored"]));
    expect(store.getState().order.codPayments).toEqual(restoredOrderState.codPayments);
    expect(store.getState().customer.customers).toEqual(restoredCustomerState.customers);
    expect(store.getState().appContext).toEqual({
        loading: false,
        currentFeatureName: "Restored feature"
    });
    expect(mockCreateAttachment).toHaveBeenCalledWith(expect.objectContaining({
        name: expect.stringContaining("Pre-restore backup")
    }), BACKUP_CARD_ID);
    await waitFor(() => expect(screen.getByText(/Khôi phục thành công/i)).toBeInTheDocument());
    expect(mockMessage.success).toHaveBeenCalledWith("Đồng bộ thành công");
});

it("restores versioned backup envelopes with the same normalized state shape", async () => {
    const envelope = createBackupEnvelope(legacyBackup, "2026-06-15T00:00:00.000Z");
    mockFetchText(JSON.stringify(envelope));
    renderMasterPage();

    await restoreFromDrawer();

    await waitFor(() => expect(store.getState().order.doneOrders).toEqual(["done-restored"]));
    expect(store.getState().order.codPayments).toEqual(restoredOrderState.codPayments);
    expect(store.getState().customer.customers).toEqual(restoredCustomerState.customers);
    expect(store.getState().appContext).toEqual({
        loading: false,
        currentFeatureName: "Restored feature"
    });
});

it("shows done refresh loading and count status", async () => {
    const refresh = createDeferred<number>();
    mockRefreshDoneOrders.mockReturnValueOnce(refresh.promise);
    renderMasterPage();

    expect(await screen.findByText("Đang kiểm tra đơn đóng hàng")).toBeInTheDocument();
    refresh.resolve(2);

    await waitFor(() => expect(screen.getByText("Có 2 đơn đã đóng hàng")).toBeInTheDocument());
});

it("shows done refresh empty success status", async () => {
    mockRefreshDoneOrders.mockResolvedValueOnce(0);
    renderMasterPage();

    await waitFor(() => expect(screen.getByText("Không có đơn đã đóng hàng")).toBeInTheDocument());
});

it("shows done refresh failure status", async () => {
    mockRefreshDoneOrders.mockRejectedValueOnce(new Error("Trello down"));
    renderMasterPage();

    await waitFor(() => expect(screen.getByText("Lỗi cập nhật đơn đóng hàng")).toBeInTheDocument());
});

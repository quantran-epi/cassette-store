import React from "react";
import {render, screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
    buildCodImportColumnMap,
    buildCodImportReview,
    normalizeCodImportRows
} from "@common/Helpers/CodPaymentImportHelper";
import type {CodImportRawRow} from "@common/Helpers/CodPaymentImportHelper";
import type {Order} from "@store/Models/Order";
import {
    ORDER_PAYMENT_METHOD,
    ORDER_PRIORITY_STATUS,
    ORDER_SHIPPING_PARTNER,
    ORDER_STATUS
} from "@common/Constants/AppConstants";
import {OrderCodPaymentReviewWidget} from "./OrderCodPaymentReview.widget";

const buildOrder = (overrides: Partial<Order> = {}): Order => ({
    id: "order-matched",
    sequence: 1,
    createdDate: "2026-06-15T00:00:00.000Z",
    name: "Đơn đã khớp",
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

const rawRows: CodImportRawRow[] = [
    {rowNumber: 2, values: {"Shipping code": "VN001", "COD amount": "120000", "Shipping fee": "", "Status": "Paid", "Paid date": "2026-06-15"}},
    {rowNumber: 3, values: {"Shipping code": "VN404", "COD amount": "90000", "Shipping fee": "", "Status": "Paid", "Paid date": "2026-06-15"}}
];

const orders = [buildOrder()];

const buildReview = () => buildCodImportReview(
    normalizeCodImportRows(rawRows, buildCodImportColumnMap(rawRows)),
    orders
);

it("renders Vietnamese COD review labels and guarded apply state", async () => {
    const onChange = jest.fn();
    const onApply = jest.fn();

    render(<OrderCodPaymentReviewWidget review={buildReview()} orders={orders} onChange={onChange} onApply={onApply}/>);

    expect(screen.getByText(/^Đã khớp: 1$/)).toBeInTheDocument();
    expect(screen.getByText(/^Chưa khớp: 1$/)).toBeInTheDocument();
    expect(screen.getByText(/^Trùng: 0$/)).toBeInTheDocument();
    expect(screen.getByText(/^Lệch số tiền: 0$/)).toBeInTheDocument();
    expect(screen.getByText(/^Đã thanh toán: 0$/)).toBeInTheDocument();
    expect(screen.getByText("Có dòng cần kiểm tra. Xử lý hoặc bỏ chọn trước khi áp dụng.")).toBeInTheDocument();
    expect(screen.getByText("Đã xác nhận: 1")).toBeInTheDocument();
    expect(screen.getByText("Cần xử lý: 1")).toBeInTheDocument();

    expect(screen.getByText("Dòng 2")).toBeInTheDocument();
    expect(screen.getByText("Đã xác nhận")).toBeInTheDocument();
    expect(screen.getByText("Bao gồm")).toBeInTheDocument();
    expect(screen.getByText("Đã khớp với đơn: Đơn đã khớp")).toBeInTheDocument();
    expect(screen.getByText("COD từ file: 120,000 đ")).toBeInTheDocument();
    expect(screen.getByText("COD trong app: 120,000 đ")).toBeInTheDocument();
    expect(screen.getByRole("button", {name: /Áp dụng các dòng COD đã xác nhận/i})).toBeDisabled();

    await userEvent.click(screen.getByRole("tab", {name: /Trùng \(0\)/i}));
    expect(await screen.findByText("Không có dòng nào trong nhóm này")).toBeInTheDocument();
});

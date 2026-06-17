import {
    buildCodImportApplyPayload,
    buildCodImportColumnMap,
    buildCodImportReview,
    canApplyCodImportReview,
    detectKnownCodColumns,
    normalizeCodImportRows,
    normalizeShippingCode,
    updateCodImportReviewRow
} from "./CodPaymentImportHelper";
import type {CodImportRawRow, CodImportReviewBucket} from "./CodPaymentImportHelper";
import type {Order} from "@store/Models/Order";
import {
    ORDER_PAYMENT_METHOD,
    ORDER_PRIORITY_STATUS,
    ORDER_SHIPPING_PARTNER,
    ORDER_STATUS
} from "@common/Constants/AppConstants";

const buildOrder = (overrides: Partial<Order> = {}): Order => ({
    id: "order-1",
    sequence: 1,
    createdDate: "2026-06-15T00:00:00.000Z",
    name: "Order 1",
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
    {rowNumber: 2, values: {"Mã vận đơn": " vn 001 ", "Tiền COD": "120,000", "Phí vận chuyển": "", "Trạng thái": "Đã trả", "Ngày trả COD": "2026-06-15"}},
    {rowNumber: 3, values: {"Mã vận đơn": "VN404", "Tiền COD": "90000", "Phí vận chuyển": "", "Trạng thái": "Đã trả", "Ngày trả COD": "2026-06-15"}},
    {rowNumber: 4, values: {"Mã vận đơn": "VN002", "Tiền COD": "130000", "Phí vận chuyển": "", "Trạng thái": "Đã trả", "Ngày trả COD": "2026-06-15"}},
    {rowNumber: 5, values: {"Mã vận đơn": " vn002 ", "Tiền COD": "130000", "Phí vận chuyển": "", "Trạng thái": "Đã trả", "Ngày trả COD": "2026-06-15"}},
    {rowNumber: 6, values: {"Mã vận đơn": "VN003", "Tiền COD": "210000", "Phí vận chuyển": "", "Trạng thái": "Đã trả", "Ngày trả COD": "2026-06-15"}},
    {rowNumber: 7, values: {"Mã vận đơn": "VN004", "Tiền COD": "140000", "Phí vận chuyển": "", "Trạng thái": "Đã trả", "Ngày trả COD": "2026-06-15"}},
    {rowNumber: 8, values: {"Mã vận đơn": "", "Tiền COD": "50000", "Phí vận chuyển": "", "Trạng thái": "Đã trả", "Ngày trả COD": "2026-06-15"}},
    {rowNumber: 9, values: {"Mã vận đơn": "VN005", "Tiền COD": "0", "Phí vận chuyển": "20520", "Trạng thái": "Đã trả", "Ngày trả COD": "2026-06-15"}},
    {rowNumber: 10, values: {"Mã vận đơn": "DUPLOCAL", "Tiền COD": "100000", "Phí vận chuyển": "", "Trạng thái": "Đã trả", "Ngày trả COD": "2026-06-15"}},
    {rowNumber: 11, values: {"Mã vận đơn": "VNMANUAL", "Tiền COD": "75000", "Phí vận chuyển": "", "Trạng thái": "Đã trả", "Ngày trả COD": "2026-06-15"}}
];

const orders: Order[] = [
    buildOrder({id: "order-matched", sequence: 1, shippingCode: "VN001", codAmount: 120000, isPayCOD: false}),
    buildOrder({id: "order-duplicate-file", sequence: 2, shippingCode: "VN002", codAmount: 130000, isPayCOD: false}),
    buildOrder({id: "order-amount-mismatch", sequence: 3, shippingCode: "VN003", codAmount: 200000, isPayCOD: false}),
    buildOrder({id: "order-already-paid", sequence: 4, shippingCode: "VN004", codAmount: 140000, isPayCOD: true}),
    buildOrder({id: "order-debit-fee", sequence: 5, shippingCode: "VN005", codAmount: 0, paymentMethod: ORDER_PAYMENT_METHOD.BANK_TRANSFER_IN_ADVANCE, isPayCOD: false}),
    buildOrder({id: "order-duplicate-local-a", sequence: 6, shippingCode: "DUPLOCAL", codAmount: 100000, isPayCOD: false}),
    buildOrder({id: "order-duplicate-local-b", sequence: 7, shippingCode: "DUPLOCAL", codAmount: 100000, isPayCOD: false}),
    buildOrder({id: "order-manual", sequence: 8, shippingCode: "VNFALLBACK", codAmount: 75000, isPayCOD: false})
];

describe("CodPaymentImportHelper", () => {
    it("normalizes shipping codes and detects known COD workbook columns", () => {
        expect(normalizeShippingCode(" vn 001 \n")).toBe("VN001");

        const detection = detectKnownCodColumns(rawRows);
        expect(detection.map).toMatchObject({
            shippingCode: "Mã vận đơn",
            codAmount: "Tiền COD",
            shippingFee: "Phí vận chuyển",
            status: "Trạng thái",
            paidDate: "Ngày trả COD"
        });
        expect(detection.confidence).toBeGreaterThanOrEqual(0.8);
        expect(buildCodImportColumnMap(rawRows, {shippingFee: "Phí vận chuyển"})).toMatchObject(detection.map);
    });

    it("normalizes workbook rows and builds all required review buckets", () => {
        const rows = normalizeCodImportRows(rawRows, buildCodImportColumnMap(rawRows));
        const review = buildCodImportReview(rows, orders);
        const bucketNames: CodImportReviewBucket[] = ["matched", "unmatched", "duplicate", "amount-mismatch", "already-paid"];

        expect(rawRows).toHaveLength(10);
        expect(bucketNames).toEqual(["matched", "unmatched", "duplicate", "amount-mismatch", "already-paid"]);
        expect(review.buckets.matched.map(row => row.shippingCode)).toEqual(["VN001", "VN005"]);
        expect(review.buckets.unmatched.map(row => row.rowNumber)).toEqual([3, 8, 11]);
        expect(review.buckets.duplicate.map(row => row.shippingCode)).toEqual(["VN002", "VN002", "DUPLOCAL"]);
        expect(review.buckets["amount-mismatch"].map(row => row.shippingCode)).toEqual(["VN003"]);
        expect(review.buckets["already-paid"].map(row => row.shippingCode)).toEqual(["VN004"]);
        expect(review.buckets.matched.find(row => row.shippingCode === "VN005")?.importedShippingFee).toBe(20520);
    });

    it("blocks apply for included unresolved rows and ignores excluded unresolved rows", () => {
        const review = buildCodImportReview(normalizeCodImportRows(rawRows, buildCodImportColumnMap(rawRows)), orders);
        const unresolvedRow = review.buckets.unmatched[0];

        expect(canApplyCodImportReview(review)).toBe(false);

        const excludedReview = updateCodImportReviewRow(review, unresolvedRow.id, {included: false});
        expect(canApplyCodImportReview(excludedReview)).toBe(false);

        const excludedAllUnresolved = [
            ...excludedReview.buckets.unmatched,
            ...excludedReview.buckets.duplicate,
            ...excludedReview.buckets["amount-mismatch"],
            ...excludedReview.buckets["already-paid"]
        ].reduce((currentReview, row) => updateCodImportReviewRow(currentReview, row.id, {included: false}), excludedReview);

        expect(canApplyCodImportReview(excludedAllUnresolved)).toBe(true);
    });

    it("builds an apply payload from included confirmed matches and manual resolutions only", () => {
        const review = buildCodImportReview(normalizeCodImportRows(rawRows, buildCodImportColumnMap(rawRows)), orders);
        const problemRowsExcluded = [
            ...review.buckets.unmatched,
            ...review.buckets.duplicate,
            ...review.buckets["amount-mismatch"],
            ...review.buckets["already-paid"]
        ].reduce((currentReview, row) => updateCodImportReviewRow(currentReview, row.id, {included: false}), review);
        const manualRow = review.buckets.unmatched.find(row => row.shippingCode === "VNMANUAL");
        const manuallyResolved = updateCodImportReviewRow(problemRowsExcluded, manualRow.id, {
            included: true,
            confirmed: true,
            bucket: "matched",
            matchedOrderId: "order-manual",
            issueIds: []
        });

        const payload = buildCodImportApplyPayload(manuallyResolved, {
            cycleId: "cod-import-1",
            cycleName: "Kỳ COD import",
            cycleDate: "2026-06-15T00:00:00.000Z"
        });

        expect(payload.blockingIssueIds).toEqual([]);
        expect(payload.paymentOrderIds).toEqual(["order-matched", "order-manual"]);
        expect(payload.debitFeeOrderIds).toEqual(["order-debit-fee"]);
        expect(payload.includedRowIds).toEqual(expect.arrayContaining([
            expect.stringContaining("2"),
            expect.stringContaining("9"),
            expect.stringContaining("11")
        ]));
    });
});

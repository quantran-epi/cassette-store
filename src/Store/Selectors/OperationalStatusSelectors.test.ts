import type {OrderSyncFailure} from "@store/Models/OrderSyncFailure";
import {buildOperationalStatusReadModel} from "./OperationalStatusSelectors";

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
    retryPayload: {orderId: "order-1"},
    ...overrides
});

describe("OperationalStatusSelectors", () => {
    it("returns compact lines for sync, backup, done refresh, and COD import issues", () => {
        const model = buildOperationalStatusReadModel({
            syncFailures: [buildSyncFailure(), buildSyncFailure({id: "failure-2"})],
            backupStatus: {type: "error", text: "Backup lỗi: Trello offline"},
            doneRefreshStatus: {type: "success", text: "Có 2 đơn đã đóng hàng"},
            codImportIssueCount: 3,
            lastCodImportIssueText: "Có dòng COD cần kiểm tra trước khi áp dụng."
        });

        expect(model.issueCount).toBe(4);
        expect(model.lines.map(line => line.title)).toEqual([
            "Đồng bộ Trello cần kiểm tra",
            "File COD cần kiểm tra",
            "Sao lưu cần kiểm tra",
            "Làm mới đơn đóng hàng"
        ]);
        expect(model.lines.find(line => line.kind === "sync")?.count).toBe(2);
        expect(model.lines.find(line => line.kind === "cod")?.count).toBe(3);
    });

    it.each([
        ["backup loading", {type: "loading", text: "Đang backup dữ liệu"}, "Sao lưu cần kiểm tra"],
        ["backup success", {type: "success", text: "Backup thành công 10:00"}, "Sao lưu"],
        ["done loading", {type: "loading", text: "Đang kiểm tra đơn đóng hàng"}, "Làm mới đơn đóng hàng"],
        ["done empty", {type: "empty", text: "Không có đơn đã đóng hàng"}, "Làm mới đơn đóng hàng"],
        ["done error", {type: "error", text: "Lỗi cập nhật đơn đóng hàng"}, "Làm mới đơn đóng hàng"]
    ])("includes %s status line", (_label, status, expectedTitle) => {
        const model = buildOperationalStatusReadModel({
            syncFailures: [],
            backupStatus: _label.toString().startsWith("backup") ? status as any : {type: "idle", text: ""},
            doneRefreshStatus: _label.toString().startsWith("done") ? status as any : {type: "idle", text: ""},
            codImportIssueCount: 0,
            lastCodImportIssueText: ""
        });

        expect(model.lines.map(line => line.title)).toContain(expectedTitle);
    });

    it("stays quiet when everything is healthy or idle", () => {
        const model = buildOperationalStatusReadModel({
            syncFailures: [],
            backupStatus: {type: "idle", text: ""},
            doneRefreshStatus: {type: "idle", text: ""},
            codImportIssueCount: 0,
            lastCodImportIssueText: ""
        });

        expect(model.issueCount).toBe(0);
        expect(model.lines).toEqual([]);
    });
});

import {createSelector} from "@reduxjs/toolkit";
import type {OrderSyncFailure} from "@store/Models/OrderSyncFailure";
import type {RootState} from "@store/Store";

export type OperationStatusKind = "sync" | "cod" | "backup" | "done";
export type OperationStatusValue = {
    type: "idle" | "loading" | "success" | "empty" | "error";
    text: string;
}

export type OperationStatusInput = {
    syncFailures: OrderSyncFailure[];
    backupStatus: OperationStatusValue;
    doneRefreshStatus: OperationStatusValue;
    codImportIssueCount: number;
    lastCodImportIssueText: string;
}

export type OperationalStatusLine = {
    kind: OperationStatusKind;
    title: string;
    text: string;
    count?: number;
    severity: "info" | "success" | "warning" | "error" | "loading";
}

export type OperationalStatusReadModel = {
    lines: OperationalStatusLine[];
    issueCount: number;
    hasIssues: boolean;
}

const _statusSeverity = (status: OperationStatusValue): OperationalStatusLine["severity"] => {
    switch (status.type) {
        case "loading":
            return "loading";
        case "success":
            return "success";
        case "error":
            return "error";
        default:
            return "info";
    }
}

export const buildOperationalStatusReadModel = (input: OperationStatusInput): OperationalStatusReadModel => {
    const syncFailures = input.syncFailures || [];
    const lines: OperationalStatusLine[] = [];

    if (syncFailures.length > 0) {
        lines.push({
            kind: "sync",
            title: "Đồng bộ Trello cần kiểm tra",
            text: `${syncFailures.length} lỗi đồng bộ Trello`,
            count: syncFailures.length,
            severity: "error"
        });
    }

    if (input.codImportIssueCount > 0) {
        lines.push({
            kind: "cod",
            title: "File COD cần kiểm tra",
            text: input.lastCodImportIssueText || `${input.codImportIssueCount} dòng COD cần kiểm tra`,
            count: input.codImportIssueCount,
            severity: "warning"
        });
    }

    if (input.backupStatus?.text) {
        lines.push({
            kind: "backup",
            title: ["loading", "error"].includes(input.backupStatus.type) ? "Sao lưu cần kiểm tra" : "Sao lưu",
            text: input.backupStatus.text,
            severity: _statusSeverity(input.backupStatus)
        });
    }

    if (input.doneRefreshStatus?.text) {
        lines.push({
            kind: "done",
            title: "Làm mới đơn đóng hàng",
            text: input.doneRefreshStatus.text,
            severity: _statusSeverity(input.doneRefreshStatus)
        });
    }

    return {
        lines,
        issueCount: lines.length,
        hasIssues: lines.length > 0
    };
}

export const selectOperationalStatusBase = createSelector(
    [
        (state: RootState) => state.order.syncFailures || [],
        (state: RootState) => state.appContext.codImportIssueCount || 0,
        (state: RootState) => state.appContext.lastCodImportIssueText || ""
    ],
    (syncFailures, codImportIssueCount, lastCodImportIssueText) => ({
        syncFailures,
        codImportIssueCount,
        lastCodImportIssueText
    })
);

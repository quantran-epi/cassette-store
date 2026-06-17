import {read, utils} from "xlsx";
import type {Order} from "@store/Models/Order";

export type CodImportColumnKey = "shippingCode" | "codAmount" | "shippingFee" | "status" | "paidDate";

export type CodImportColumnMap = Partial<Record<CodImportColumnKey, string>>;

export type CodImportRawRow = {
    rowNumber: number;
    values: Record<string, unknown>;
}

export type CodImportSettlementRow = {
    id: string;
    rowNumber: number;
    raw: Record<string, unknown>;
    shippingCode: string;
    normalizedShippingCode: string;
    codAmount: number | null;
    shippingFee: number | null;
    status: string;
    paidDate: string;
}

export type CodImportReviewBucket = "matched" | "unmatched" | "duplicate" | "amount-mismatch" | "already-paid";

export type CodImportReviewRow = {
    id: string;
    bucket: CodImportReviewBucket;
    rowNumber: number;
    shippingCode: string;
    normalizedShippingCode: string;
    importedCodAmount: number | null;
    importedShippingFee: number | null;
    importedStatus: string;
    importedPaidDate: string;
    matchedOrderId?: string;
    matchedOrderName?: string;
    currentCodAmount?: number;
    included: boolean;
    confirmed: boolean;
    issueIds: string[];
    raw: Record<string, unknown>;
}

export type CodImportReview = {
    id: string;
    sourceColumnMap: CodImportColumnMap;
    rows: CodImportReviewRow[];
    buckets: Record<CodImportReviewBucket, CodImportReviewRow[]>;
}

export type CodImportApplyPayload = {
    cycleId: string;
    cycleName: string;
    cycleDate: string;
    paymentOrderIds: string[];
    debitFeeOrderIds: string[];
    includedRowIds: string[];
    blockingIssueIds: string[];
}

export type CodImportColumnDetection = {
    map: CodImportColumnMap;
    confidence: number;
    sourceColumns: string[];
    missingRequiredColumns: CodImportColumnKey[];
}

export type CodImportApplyMetadata = {
    cycleId?: string;
    cycleName?: string;
    cycleDate?: string;
}

export type CodImportReviewRowPatch = Partial<Pick<CodImportReviewRow,
    "bucket" | "included" | "confirmed" | "matchedOrderId" | "matchedOrderName" | "currentCodAmount" | "issueIds"
>>;

const COD_IMPORT_BUCKETS: CodImportReviewBucket[] = ["matched", "unmatched", "duplicate", "amount-mismatch", "already-paid"];

const COLUMN_ALIASES: Record<CodImportColumnKey, string[]> = {
    shippingCode: [
        "ma van don", "mavandon", "ma don hang", "ma bill", "ma gui", "ma kien",
        "so van don", "van don", "shipping code", "shipment code", "tracking code", "tracking number"
    ],
    codAmount: [
        "tien cod", "tiencod", "so tien cod", "cod", "cod amount", "amount cod",
        "tien thu ho", "thu ho", "tong cod", "gia tri cod"
    ],
    shippingFee: [
        "phi van chuyen", "phivanchuyen", "phi vc", "cuoc phi", "phi ship", "phi giao hang",
        "shipping fee", "delivery fee", "shipping cost"
    ],
    status: [
        "trang thai", "trangthai", "tinh trang", "ket qua", "status", "payment status", "paid status"
    ],
    paidDate: [
        "ngay tra cod", "ngay thanh toan", "ngay thanh toan cod", "ngay chuyen tien",
        "paid date", "payment date", "settlement date"
    ]
}

const REQUIRED_COLUMN_KEYS: CodImportColumnKey[] = ["shippingCode", "codAmount"];

const _normalizeText = (value: unknown): string => {
    return String(value ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, " ")
        .trim();
}

const _compactText = (value: unknown): string => _normalizeText(value).replace(/\s+/g, "");

const _getSourceColumns = (rows: CodImportRawRow[]): string[] => {
    const columnSet = new Set<string>();
    rows.forEach(row => Object.keys(row.values || {}).forEach(key => columnSet.add(key)));
    return Array.from(columnSet);
}

const _matchesAlias = (column: string, aliases: string[]): boolean => {
    const normalizedColumn = _normalizeText(column);
    const compactColumn = _compactText(column);

    return aliases.some(alias => {
        const normalizedAlias = _normalizeText(alias);
        const compactAlias = _compactText(alias);
        const canUseContainsMatch = normalizedAlias.length >= 4 && normalizedAlias.includes(" ");
        return normalizedColumn === normalizedAlias
            || compactColumn === compactAlias
            || (canUseContainsMatch && normalizedColumn.includes(normalizedAlias))
            || (canUseContainsMatch && normalizedAlias.includes(normalizedColumn));
    });
}

const _asNumber = (value: unknown): number | null => {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    const cleaned = String(value ?? "")
        .replace(/\s/g, "")
        .replace(/[^0-9-]/g, "");
    if (!cleaned || cleaned === "-") return null;
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : null;
}

const _asString = (value: unknown): string => String(value ?? "").trim();

const _getMappedValue = (row: CodImportRawRow, map: CodImportColumnMap, key: CodImportColumnKey): unknown => {
    const columnName = map[key];
    if (!columnName) return "";
    return row.values?.[columnName];
}

const _countBy = <T>(items: T[], keyGetter: (item: T) => string): Record<string, number> => {
    return items.reduce((counts, item) => {
        const key = keyGetter(item);
        if (!key) return counts;
        counts[key] = (counts[key] || 0) + 1;
        return counts;
    }, {} as Record<string, number>);
}

const _unique = (values: string[]): string[] => Array.from(new Set(values));

const _isDebitFeeRow = (row: CodImportReviewRow): boolean => {
    return Boolean(row.matchedOrderId) && Number(row.importedShippingFee || 0) > 0;
}

const _isPaymentRow = (row: CodImportReviewRow): boolean => {
    return Boolean(row.matchedOrderId) && Number(row.importedCodAmount || 0) > 0;
}

const _isApplyReadyRow = (row: CodImportReviewRow): boolean => {
    return row.included
        && row.confirmed
        && row.bucket === "matched"
        && Boolean(row.matchedOrderId)
        && row.issueIds.length === 0;
}

const _getBlockingIssueIds = (row: CodImportReviewRow): string[] => {
    if (!row.included) return [];
    if (_isApplyReadyRow(row)) return [];
    return row.issueIds.length > 0 ? row.issueIds : [`${row.id}:unresolved`];
}

const _buildBuckets = (rows: CodImportReviewRow[]): Record<CodImportReviewBucket, CodImportReviewRow[]> => {
    return COD_IMPORT_BUCKETS.reduce((buckets, bucket) => {
        buckets[bucket] = rows.filter(row => row.bucket === bucket);
        return buckets;
    }, {} as Record<CodImportReviewBucket, CodImportReviewRow[]>);
}

export const normalizeShippingCode = (value: unknown): string => {
    return String(value ?? "").toUpperCase().replace(/\s+/g, "").trim();
}

export const parseCodWorkbookRows = async (file: File): Promise<CodImportRawRow[]> => {
    const buffer = await file.arrayBuffer();
    const workbook = read(buffer, {type: "array"});
    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) return [];

    const worksheet = workbook.Sheets[firstSheetName];
    const rows = utils.sheet_to_json<Record<string, unknown>>(worksheet, {defval: "", raw: false});
    return rows.map((values, index) => ({
        rowNumber: index + 2,
        values
    }));
}

export const detectKnownCodColumns = (rows: CodImportRawRow[]): CodImportColumnDetection => {
    const sourceColumns = _getSourceColumns(rows);
    const map = (Object.keys(COLUMN_ALIASES) as CodImportColumnKey[]).reduce((currentMap, key) => {
        const column = sourceColumns.find(sourceColumn => _matchesAlias(sourceColumn, COLUMN_ALIASES[key]));
        if (column) currentMap[key] = column;
        return currentMap;
    }, {} as CodImportColumnMap);
    const matchedColumns = Object.values(map).filter(Boolean).length;

    return {
        map,
        sourceColumns,
        confidence: sourceColumns.length === 0 ? 0 : matchedColumns / Object.keys(COLUMN_ALIASES).length,
        missingRequiredColumns: REQUIRED_COLUMN_KEYS.filter(key => !map[key])
    }
}

export const buildCodImportColumnMap = (rows: CodImportRawRow[], overrides: CodImportColumnMap = {}): CodImportColumnMap => {
    return {
        ...detectKnownCodColumns(rows).map,
        ...overrides
    }
}

export const normalizeCodImportRows = (rows: CodImportRawRow[], columnMap: CodImportColumnMap): CodImportSettlementRow[] => {
    return rows.map(row => {
        const shippingCode = _asString(_getMappedValue(row, columnMap, "shippingCode"));
        return {
            id: `cod-row-${row.rowNumber}`,
            rowNumber: row.rowNumber,
            raw: row.values,
            shippingCode: normalizeShippingCode(shippingCode),
            normalizedShippingCode: normalizeShippingCode(shippingCode),
            codAmount: _asNumber(_getMappedValue(row, columnMap, "codAmount")),
            shippingFee: _asNumber(_getMappedValue(row, columnMap, "shippingFee")),
            status: _asString(_getMappedValue(row, columnMap, "status")),
            paidDate: _asString(_getMappedValue(row, columnMap, "paidDate"))
        }
    });
}

export const buildCodImportReview = (
    settlementRows: CodImportSettlementRow[],
    orders: Order[],
    sourceColumnMap: CodImportColumnMap = {}
): CodImportReview => {
    const fileCodeCounts = _countBy(settlementRows, row => row.normalizedShippingCode);
    const orderCountsByShippingCode = _countBy(orders, order => normalizeShippingCode(order.shippingCode));
    const ordersByShippingCode = orders.reduce((map, order) => {
        const code = normalizeShippingCode(order.shippingCode);
        if (!code) return map;
        map[code] = [...(map[code] || []), order];
        return map;
    }, {} as Record<string, Order[]>);

    const rows = settlementRows.map(row => {
        const matchedOrders = ordersByShippingCode[row.normalizedShippingCode] || [];
        const matchedOrder = matchedOrders[0];
        let bucket: CodImportReviewBucket = "matched";
        let issueIds: string[] = [];

        if (!row.normalizedShippingCode) {
            bucket = "unmatched";
            issueIds = [`${row.id}:missing-shipping-code`];
        } else if (fileCodeCounts[row.normalizedShippingCode] > 1 || orderCountsByShippingCode[row.normalizedShippingCode] > 1) {
            bucket = "duplicate";
            issueIds = [`${row.id}:duplicate-shipping-code`];
        } else if (!matchedOrder) {
            bucket = "unmatched";
            issueIds = [`${row.id}:unmatched`];
        } else if (matchedOrder.isPayCOD) {
            bucket = "already-paid";
            issueIds = [`${row.id}:already-paid`];
        } else if (row.codAmount === null || row.codAmount !== matchedOrder.codAmount) {
            bucket = "amount-mismatch";
            issueIds = [`${row.id}:amount-mismatch`];
        }

        const isMatched = bucket === "matched";
        return {
            id: row.id,
            bucket,
            rowNumber: row.rowNumber,
            shippingCode: row.shippingCode,
            normalizedShippingCode: row.normalizedShippingCode,
            importedCodAmount: row.codAmount,
            importedShippingFee: row.shippingFee,
            importedStatus: row.status,
            importedPaidDate: row.paidDate,
            matchedOrderId: matchedOrder?.id,
            matchedOrderName: matchedOrder?.name,
            currentCodAmount: matchedOrder?.codAmount,
            included: true,
            confirmed: isMatched,
            issueIds,
            raw: row.raw
        } as CodImportReviewRow;
    });

    return {
        id: `cod-import-${new Date().toISOString()}`,
        sourceColumnMap,
        rows,
        buckets: _buildBuckets(rows)
    }
}

export const updateCodImportReviewRow = (
    review: CodImportReview,
    rowId: string,
    patch: CodImportReviewRowPatch
): CodImportReview => {
    const rows = review.rows.map(row => row.id === rowId ? {...row, ...patch} : row);
    return {
        ...review,
        rows,
        buckets: _buildBuckets(rows)
    }
}

export const buildCodImportApplyPayload = (
    review: CodImportReview,
    metadata: CodImportApplyMetadata = {}
): CodImportApplyPayload => {
    const includedRows = review.rows.filter(row => row.included);
    const readyRows = includedRows.filter(_isApplyReadyRow);
    const now = new Date().toISOString();

    return {
        cycleId: metadata.cycleId || review.id,
        cycleName: metadata.cycleName || "Kỳ trả COD import",
        cycleDate: metadata.cycleDate || now,
        paymentOrderIds: _unique(readyRows
            .filter(row => _isPaymentRow(row))
            .map(row => row.matchedOrderId as string)),
        debitFeeOrderIds: _unique(readyRows
            .filter(row => _isDebitFeeRow(row))
            .map(row => row.matchedOrderId as string)),
        includedRowIds: includedRows.map(row => row.id),
        blockingIssueIds: includedRows.flatMap(_getBlockingIssueIds)
    }
}

export const canApplyCodImportReview = (review: CodImportReview): boolean => {
    const includedRows = review.rows.filter(row => row.included);
    return includedRows.some(_isApplyReadyRow) && includedRows.flatMap(_getBlockingIssueIds).length === 0;
}

export const isCodImportReviewPaymentRow = (row: CodImportReviewRow): boolean => {
    return _isPaymentRow(row);
}

export const isCodImportReviewDebitFeeRow = (row: CodImportReviewRow): boolean => {
    return _isDebitFeeRow(row);
}

export const isCodImportReviewReadyRow = (row: CodImportReviewRow): boolean => {
    return _isApplyReadyRow(row);
}

import type {RootState} from "@store/Store";
import type {OrderState} from "@store/Reducers/OrderReducer";
import type {CustomerState} from "@store/Reducers/CustomerReducer";
import type {AppContextState} from "@store/Reducers/AppContextReducer";

export const BACKUP_SCHEMA_VERSION = 1;

export type BackupPayload = {
    order: OrderState;
    customer: CustomerState;
    appContext: AppContextState;
}

export type BackupEnvelope = {
    schemaVersion: number;
    createdAt: string;
    appVersion?: string;
    payload: BackupPayload;
}

export type BackupRestoreErrorCode =
    "empty_backup"
    | "invalid_json"
    | "invalid_backup"
    | "unsupported_schema_version"
    | "missing_order"
    | "missing_customer";

export type BackupRestoreResult =
    | { ok: true; envelope: BackupEnvelope; payload: BackupPayload; isLegacy: boolean; }
    | { ok: false; code: BackupRestoreErrorCode; message: string; }

const _isObject = (value: unknown): value is Record<string, any> => {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

const _asArray = <T>(value: unknown): T[] => {
    return Array.isArray(value) ? value as T[] : [];
}

const _asNumber = (value: unknown, fallback: number): number => {
    return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

const _asString = (value: unknown, fallback: string): string => {
    return typeof value === "string" ? value : fallback;
}

const _asBoolean = (value: unknown, fallback: boolean): boolean => {
    return typeof value === "boolean" ? value : fallback;
}

const _normalizeOrderState = (order: Record<string, any>): OrderState => {
    return {
        orders: _asArray(order.orders),
        lastSequence: _asNumber(order.lastSequence, 0),
        doneOrders: _asArray<string>(order.doneOrders),
        codPayments: _asArray(order.codPayments),
        syncFailures: _asArray(order.syncFailures)
    }
}

const _normalizeCustomerState = (customer: Record<string, any>): CustomerState => {
    return {
        customers: _asArray(customer.customers)
    }
}

export const normalizeAppContextState = (appContext?: Partial<AppContextState> | null): AppContextState => {
    return {
        loading: false,
        currentFeatureName: _asString(appContext?.currentFeatureName, "") || ""
    }
}

export const createBackupEnvelope = (rootState: RootState, createdAt: string = new Date().toISOString()): BackupEnvelope => {
    return {
        schemaVersion: BACKUP_SCHEMA_VERSION,
        createdAt,
        appVersion: process.env.REACT_APP_VERSION || process.env.npm_package_version,
        payload: {
            order: _normalizeOrderState(rootState.order as unknown as Record<string, any>),
            customer: _normalizeCustomerState(rootState.customer as unknown as Record<string, any>),
            appContext: normalizeAppContextState(rootState.appContext)
        }
    }
}

export const normalizeBackup = (input: unknown): BackupRestoreResult => {
    if (!_isObject(input)) {
        return {
            ok: false,
            code: "invalid_backup",
            message: "Dữ liệu backup không đúng định dạng."
        }
    }

    const hasEnvelopeShape = Object.prototype.hasOwnProperty.call(input, "schemaVersion")
        || Object.prototype.hasOwnProperty.call(input, "payload");

    if (hasEnvelopeShape) {
        const schemaVersion = _asNumber(input.schemaVersion, 0);
        if (schemaVersion !== BACKUP_SCHEMA_VERSION) {
            return {
                ok: false,
                code: "unsupported_schema_version",
                message: `Phiên bản backup không được hỗ trợ: ${input.schemaVersion}`
            }
        }
    }

    const source = hasEnvelopeShape ? input.payload : input;
    if (!_isObject(source)) {
        return {
            ok: false,
            code: "invalid_backup",
            message: "Backup thiếu phần dữ liệu chính."
        }
    }

    if (!_isObject(source.order)) {
        return {
            ok: false,
            code: "missing_order",
            message: "Backup thiếu dữ liệu đơn hàng."
        }
    }

    if (!_isObject(source.customer)) {
        return {
            ok: false,
            code: "missing_customer",
            message: "Backup thiếu dữ liệu khách hàng."
        }
    }

    const payload: BackupPayload = {
        order: _normalizeOrderState(source.order),
        customer: _normalizeCustomerState(source.customer),
        appContext: normalizeAppContextState(_isObject(source.appContext) ? source.appContext : null)
    }

    const appVersion = _asString(input.appVersion, "");
    return {
        ok: true,
        isLegacy: !hasEnvelopeShape,
        payload,
        envelope: {
            schemaVersion: BACKUP_SCHEMA_VERSION,
            createdAt: _asString(input.createdAt, new Date().toISOString()),
            ...(appVersion ? {appVersion} : {}),
            payload
        }
    }
}

export const parseBackupText = (text: string): BackupRestoreResult => {
    if (!text || !text.trim()) {
        return {
            ok: false,
            code: "empty_backup",
            message: "File backup đang trống."
        }
    }

    try {
        return normalizeBackup(JSON.parse(text));
    } catch (e) {
        return {
            ok: false,
            code: "invalid_json",
            message: "File backup không phải JSON hợp lệ."
        }
    }
}

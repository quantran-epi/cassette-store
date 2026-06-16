import {
    BACKUP_SCHEMA_VERSION,
    createBackupEnvelope,
    normalizeBackup,
    parseBackupText
} from "./BackupHelper";

const createRootState = (overrides: any = {}) => ({
    appContext: {
        loading: true,
        currentFeatureName: "Đơn hàng"
    },
    customer: {
        customers: [{id: "customer-1", name: "Customer 1"}]
    },
    order: {
        orders: [{id: "order-1", name: "Order 1"}],
        lastSequence: 7,
        doneOrders: ["card-1"],
        codPayments: [{id: "cod-1", name: "Cycle 1"}],
        syncFailures: [{
            id: "failure-1",
            orderId: "order-1",
            operation: "create-card",
            status: "failed",
            message: "Could not create card",
            retryable: true,
            createdAt: "2026-06-15T00:00:00.000Z",
            updatedAt: "2026-06-15T00:00:00.000Z"
        }]
    },
    ...overrides
});

describe("BackupHelper", () => {
    test("creates a versioned backup envelope with required persisted sections", () => {
        const envelope = createBackupEnvelope(createRootState() as any, "2026-06-15T00:00:00.000Z");

        expect(envelope.schemaVersion).toBe(BACKUP_SCHEMA_VERSION);
        expect(envelope.createdAt).toBe("2026-06-15T00:00:00.000Z");
        expect(envelope.payload.order.orders).toEqual([{id: "order-1", name: "Order 1"}]);
        expect(envelope.payload.order.lastSequence).toBe(7);
        expect(envelope.payload.order.doneOrders).toEqual(["card-1"]);
        expect(envelope.payload.order.codPayments).toEqual([{id: "cod-1", name: "Cycle 1"}]);
        expect(envelope.payload.order.syncFailures).toEqual([{ 
            id: "failure-1",
            orderId: "order-1",
            operation: "create-card",
            status: "failed",
            message: "Could not create card",
            retryable: true,
            createdAt: "2026-06-15T00:00:00.000Z",
            updatedAt: "2026-06-15T00:00:00.000Z"
        }]);
        expect(envelope.payload.customer.customers).toEqual([{id: "customer-1", name: "Customer 1"}]);
        expect(envelope.payload.appContext).toEqual({loading: false, currentFeatureName: "Đơn hàng"});
    });

    test("normalizes a current backup envelope", () => {
        const envelope = createBackupEnvelope(createRootState() as any, "2026-06-15T00:00:00.000Z");
        const result = normalizeBackup(envelope);

        expect(result.ok).toBe(true);
        if (!result.ok) return;
        expect(result.isLegacy).toBe(false);
        expect(result.payload.order.doneOrders).toEqual(["card-1"]);
        expect(result.payload.order.codPayments).toEqual([{id: "cod-1", name: "Cycle 1"}]);
        expect(result.payload.order.syncFailures).toHaveLength(1);
        expect(result.payload.order.syncFailures[0]).toMatchObject({
            id: "failure-1",
            operation: "create-card",
            status: "failed"
        });
    });

    test("normalizes legacy raw RootState backups with explicit defaults", () => {
        const legacyState = createRootState({
            order: {
                orders: [{id: "order-1"}],
                lastSequence: 3
            },
            customer: {},
            appContext: undefined
        });

        const result = normalizeBackup(legacyState);

        expect(result.ok).toBe(true);
        if (!result.ok) return;
        expect(result.isLegacy).toBe(true);
        expect(result.payload.order.orders).toEqual([{id: "order-1"}]);
        expect(result.payload.order.lastSequence).toBe(3);
        expect(result.payload.order.doneOrders).toEqual([]);
        expect(result.payload.order.codPayments).toEqual([]);
        expect(result.payload.order.syncFailures).toEqual([]);
        expect(result.payload.customer.customers).toEqual([]);
        expect(result.payload.appContext).toEqual({loading: false, currentFeatureName: ""});
    });

    test("parses valid backup JSON text", () => {
        const envelope = createBackupEnvelope(createRootState() as any, "2026-06-15T00:00:00.000Z");
        const result = parseBackupText(JSON.stringify(envelope));

        expect(result.ok).toBe(true);
        if (!result.ok) return;
        expect(result.payload.order.orders).toHaveLength(1);
    });

    test("returns an empty backup error for empty input", () => {
        expect(parseBackupText(" ")).toMatchObject({
            ok: false,
            code: "empty_backup"
        });
    });

    test("returns an invalid JSON error for malformed text", () => {
        expect(parseBackupText("{not-json")).toMatchObject({
            ok: false,
            code: "invalid_json"
        });
    });

    test("returns unsupported schema error for unknown envelope versions", () => {
        expect(normalizeBackup({
            schemaVersion: BACKUP_SCHEMA_VERSION + 1,
            payload: createRootState()
        })).toMatchObject({
            ok: false,
            code: "unsupported_schema_version"
        });
    });

    test("returns missing order section error", () => {
        expect(normalizeBackup({
            schemaVersion: BACKUP_SCHEMA_VERSION,
            payload: {
                customer: {customers: []}
            }
        })).toMatchObject({
            ok: false,
            code: "missing_order"
        });
    });

    test("returns missing customer section error", () => {
        expect(normalizeBackup({
            schemaVersion: BACKUP_SCHEMA_VERSION,
            payload: {
                order: {orders: [], lastSequence: 0}
            }
        })).toMatchObject({
            ok: false,
            code: "missing_customer"
        });
    });
});

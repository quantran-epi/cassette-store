import {ORDER_STATUS} from "@common/Constants/AppConstants";

export type OrderListSort = "newest" | "oldest" | "priority" | "amount" | "cod";
export type OrderListCodState = "all" | "paid" | "unpaid" | "non-cod";
export type OrderListShippingState = "all" | "has-code" | "missing-code" | "done-order";

export type OrderListQuery = {
    text: string;
    statuses: string[];
    codState: OrderListCodState;
    shippingState: OrderListShippingState;
    dateFrom?: string;
    dateTo?: string;
    sort: OrderListSort;
    page: number;
    pageSize: number;
}

export type OrderListQueryPatch = Partial<OrderListQuery>;

export const ORDER_LIST_QUERY_PARAMS = {
    text: "q",
    statuses: "status",
    codState: "cod",
    shippingState: "ship",
    dateFrom: "from",
    dateTo: "to",
    sort: "sort",
    page: "page"
} as const;

export const DEFAULT_ORDER_LIST_QUERY: OrderListQuery = {
    text: "",
    statuses: [],
    codState: "all",
    shippingState: "all",
    sort: "newest",
    page: 1,
    pageSize: 10
}

const VALID_COD_STATES: OrderListCodState[] = ["all", "paid", "unpaid", "non-cod"];
const VALID_SHIPPING_STATES: OrderListShippingState[] = ["all", "has-code", "missing-code", "done-order"];
const VALID_SORTS: OrderListSort[] = ["newest", "oldest", "priority", "amount", "cod"];

const STATUS_VALUE_BY_KEY = Object.entries(ORDER_STATUS).reduce<Record<string, string>>((result, [key, value]) => {
    result[key] = value;
    result[value] = value;
    return result;
}, {});

const STATUS_KEY_BY_VALUE = Object.entries(ORDER_STATUS).reduce<Record<string, string>>((result, [key, value]) => {
    result[value] = key;
    result[key] = key;
    return result;
}, {});

const _asSearchParams = (query: URLSearchParams | string | undefined): URLSearchParams => {
    if (query instanceof URLSearchParams) return new URLSearchParams(query.toString());
    return new URLSearchParams(String(query || "").replace(/^\?/, ""));
}

const _asOption = <T extends string>(value: string | null, validValues: T[], fallback: T): T => {
    return validValues.includes(value as T) ? value as T : fallback;
}

const _asPositivePage = (value: unknown): number => {
    const page = Number(value);
    if (!Number.isFinite(page) || page < 1) return 1;
    return Math.floor(page);
}

const _asDate = (value?: string): string | undefined => {
    if (!value) return undefined;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
    const date = new Date(`${value}T00:00:00.000Z`);
    return Number.isNaN(date.getTime()) ? undefined : value;
}

const _unique = (values: string[]): string[] => Array.from(new Set(values));

const _parseStatuses = (value: string | null): string[] => {
    if (!value) return [];
    return _unique(value.split(",")
        .map(status => status.trim())
        .filter(Boolean)
        .map(status => STATUS_VALUE_BY_KEY[status])
        .filter(Boolean));
}

const _serializeStatuses = (statuses: string[]): string => {
    return _unique(statuses || [])
        .map(status => STATUS_KEY_BY_VALUE[status])
        .filter(Boolean)
        .join(",");
}

const _normalizeQuery = (query: Partial<OrderListQuery> = {}): OrderListQuery => ({
    ...DEFAULT_ORDER_LIST_QUERY,
    ...query,
    text: String(query.text || "").trim(),
    statuses: _unique((query.statuses || [])
        .map(status => STATUS_VALUE_BY_KEY[status] || status)
        .filter(status => Boolean(STATUS_KEY_BY_VALUE[status]))),
    codState: VALID_COD_STATES.includes(query.codState as OrderListCodState) ? query.codState as OrderListCodState : DEFAULT_ORDER_LIST_QUERY.codState,
    shippingState: VALID_SHIPPING_STATES.includes(query.shippingState as OrderListShippingState) ? query.shippingState as OrderListShippingState : DEFAULT_ORDER_LIST_QUERY.shippingState,
    dateFrom: _asDate(query.dateFrom),
    dateTo: _asDate(query.dateTo),
    sort: VALID_SORTS.includes(query.sort as OrderListSort) ? query.sort as OrderListSort : DEFAULT_ORDER_LIST_QUERY.sort,
    page: _asPositivePage(query.page || DEFAULT_ORDER_LIST_QUERY.page),
    pageSize: _asPositivePage(query.pageSize || DEFAULT_ORDER_LIST_QUERY.pageSize)
});

export const parseOrderListQuery = (query: URLSearchParams | string | undefined): OrderListQuery => {
    const params = _asSearchParams(query);
    return _normalizeQuery({
        text: params.get(ORDER_LIST_QUERY_PARAMS.text) || "",
        statuses: _parseStatuses(params.get(ORDER_LIST_QUERY_PARAMS.statuses)),
        codState: _asOption(params.get(ORDER_LIST_QUERY_PARAMS.codState), VALID_COD_STATES, DEFAULT_ORDER_LIST_QUERY.codState),
        shippingState: _asOption(params.get(ORDER_LIST_QUERY_PARAMS.shippingState), VALID_SHIPPING_STATES, DEFAULT_ORDER_LIST_QUERY.shippingState),
        dateFrom: params.get(ORDER_LIST_QUERY_PARAMS.dateFrom) || undefined,
        dateTo: params.get(ORDER_LIST_QUERY_PARAMS.dateTo) || undefined,
        sort: _asOption(params.get(ORDER_LIST_QUERY_PARAMS.sort), VALID_SORTS, DEFAULT_ORDER_LIST_QUERY.sort),
        page: _asPositivePage(params.get(ORDER_LIST_QUERY_PARAMS.page) || DEFAULT_ORDER_LIST_QUERY.page)
    });
}

export const serializeOrderListQuery = (query: Partial<OrderListQuery> = {}): URLSearchParams => {
    const normalized = _normalizeQuery(query);
    const params = new URLSearchParams();
    if (normalized.text) params.set(ORDER_LIST_QUERY_PARAMS.text, normalized.text);

    const statuses = _serializeStatuses(normalized.statuses);
    if (statuses) params.set(ORDER_LIST_QUERY_PARAMS.statuses, statuses);

    if (normalized.codState !== DEFAULT_ORDER_LIST_QUERY.codState) params.set(ORDER_LIST_QUERY_PARAMS.codState, normalized.codState);
    if (normalized.shippingState !== DEFAULT_ORDER_LIST_QUERY.shippingState) params.set(ORDER_LIST_QUERY_PARAMS.shippingState, normalized.shippingState);
    if (normalized.dateFrom) params.set(ORDER_LIST_QUERY_PARAMS.dateFrom, normalized.dateFrom);
    if (normalized.dateTo) params.set(ORDER_LIST_QUERY_PARAMS.dateTo, normalized.dateTo);
    if (normalized.sort !== DEFAULT_ORDER_LIST_QUERY.sort) params.set(ORDER_LIST_QUERY_PARAMS.sort, normalized.sort);
    if (normalized.page > 1) params.set(ORDER_LIST_QUERY_PARAMS.page, String(normalized.page));
    return params;
}

const _patchChangesFilter = (patch: OrderListQueryPatch = {}): boolean => {
    return Object.keys(patch).some(key => key !== "page" && key !== "pageSize");
}

export const mergeOrderListQuery = (
    query: Partial<OrderListQuery> = {},
    patch: OrderListQueryPatch = {},
    options: {resetPage?: boolean} = {}
): OrderListQuery => {
    const merged = _normalizeQuery({..._normalizeQuery(query), ...patch});
    if (options.resetPage && _patchChangesFilter(patch)) merged.page = 1;
    return merged;
}

export const isDefaultOrderListQuery = (query: Partial<OrderListQuery> = {}): boolean => {
    return serializeOrderListQuery(query).toString() === "";
}

export const hasActiveOrderListFilters = (query: Partial<OrderListQuery> = {}): boolean => {
    const normalized = _normalizeQuery(query);
    return Boolean(
        normalized.text
        || normalized.statuses.length > 0
        || normalized.codState !== DEFAULT_ORDER_LIST_QUERY.codState
        || normalized.shippingState !== DEFAULT_ORDER_LIST_QUERY.shippingState
        || normalized.dateFrom
        || normalized.dateTo
        || normalized.sort !== DEFAULT_ORDER_LIST_QUERY.sort
    );
}

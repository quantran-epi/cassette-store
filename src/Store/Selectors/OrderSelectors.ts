import {createSelector} from "@reduxjs/toolkit";
import {ORDER_PAYMENT_METHOD} from "@common/Constants/AppConstants";
import type {Customer} from "@store/Models/Customer";
import type {Order} from "@store/Models/Order";
import type {RootState} from "@store/Store";

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

export type OrderListSummary = {
    orderCount: number;
    cassetteCount: number;
    cashAmount: number;
    codReceivedAmount: number;
    statusCounts: Record<string, number>;
    codPaidCount: number;
    codUnpaidCount: number;
    nonCodCount: number;
}

export type JoinedOrderReadModel = Order & {
    customer?: Customer;
    doneInTrello: boolean;
}

export type OrderListReadModel = {
    orders: JoinedOrderReadModel[];
    allFilteredRows: JoinedOrderReadModel[];
    pageRows: JoinedOrderReadModel[];
    summary: OrderListSummary;
    page: number;
    pageSize: number;
    totalPages: number;
}

export const DEFAULT_ORDER_LIST_QUERY: OrderListQuery = {
    text: "",
    statuses: [],
    codState: "all",
    shippingState: "all",
    sort: "newest",
    page: 1,
    pageSize: 10
}

type BuildOrderListReadModelProps = {
    orders: Order[];
    customers: Customer[];
    doneOrders?: string[];
    query?: Partial<OrderListQuery>;
}

const normalizeText = (value?: unknown): string => String(value || "").trim().toLowerCase();

const parseDayTime = (value: string | undefined, endOfDay = false): number | null => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    if (endOfDay) date.setHours(23, 59, 59, 999);
    else date.setHours(0, 0, 0, 0);
    return date.getTime();
}

const getOrderDayTime = (order: Order): number => {
    const date = new Date(order.createdDate);
    if (Number.isNaN(date.getTime())) return 0;
    date.setHours(0, 0, 0, 0);
    return date.getTime();
}

const hasShippingCode = (order: Order): boolean => Boolean(order.shippingCode && order.shippingCode.trim());

const isCashCodOrder = (order: Order): boolean => order.paymentMethod === ORDER_PAYMENT_METHOD.CASH_COD;

const buildSearchCorpus = (order: JoinedOrderReadModel): string => normalizeText([
    order.name,
    order.shippingCode,
    order.note,
    order.important,
    order.customer?.name,
    order.customer?.mobile,
    order.customer?.address,
    order.customer?.province
].join(" "));

export const mergeOrderListQuery = (query: Partial<OrderListQuery> = {}): OrderListQuery => ({
    ...DEFAULT_ORDER_LIST_QUERY,
    ...query,
    statuses: query.statuses || DEFAULT_ORDER_LIST_QUERY.statuses,
    page: Math.max(1, Number(query.page || DEFAULT_ORDER_LIST_QUERY.page)),
    pageSize: Math.max(1, Number(query.pageSize || DEFAULT_ORDER_LIST_QUERY.pageSize))
});

export const buildOrderListSummary = (orders: JoinedOrderReadModel[]): OrderListSummary => {
    return orders.reduce<OrderListSummary>((summary, order) => {
        summary.orderCount += 1;
        summary.cassetteCount += order.placedItems.reduce((total, item) => total + item.count, 0);
        summary.cashAmount += order.paymentAmount - order.shippingCost;
        summary.codReceivedAmount += order.codAmount - order.shippingCost;
        summary.statusCounts[order.status] = (summary.statusCounts[order.status] || 0) + 1;
        if (order.isPayCOD) summary.codPaidCount += 1;
        if (isCashCodOrder(order) && !order.isPayCOD) summary.codUnpaidCount += 1;
        if (!isCashCodOrder(order)) summary.nonCodCount += 1;
        return summary;
    }, {
        orderCount: 0,
        cassetteCount: 0,
        cashAmount: 0,
        codReceivedAmount: 0,
        statusCounts: {},
        codPaidCount: 0,
        codUnpaidCount: 0,
        nonCodCount: 0
    });
}

export const buildOrderListReadModel = (props: BuildOrderListReadModelProps): OrderListReadModel => {
    const query = mergeOrderListQuery(props.query);
    const customerById = new Map((props.customers || []).map(customer => [customer.id, customer]));
    const doneOrderIds = new Set(props.doneOrders || []);
    const text = normalizeText(query.text);
    const fromTime = parseDayTime(query.dateFrom);
    const toTime = parseDayTime(query.dateTo, true);

    const joined = (props.orders || []).map<JoinedOrderReadModel>(order => ({
        ...order,
        customer: customerById.get(order.customerId),
        doneInTrello: Boolean(order.trelloCardId && doneOrderIds.has(order.trelloCardId))
    }));

    const filtered = joined.filter(order => {
        if (text && !buildSearchCorpus(order).includes(text)) return false;
        if (query.statuses.length > 0 && !query.statuses.includes(order.status)) return false;
        if (query.codState === "paid" && !order.isPayCOD) return false;
        if (query.codState === "unpaid" && (!isCashCodOrder(order) || order.isPayCOD)) return false;
        if (query.codState === "non-cod" && isCashCodOrder(order)) return false;
        if (query.shippingState === "has-code" && !hasShippingCode(order)) return false;
        if (query.shippingState === "missing-code" && hasShippingCode(order)) return false;
        if (query.shippingState === "done-order" && !order.doneInTrello) return false;

        const orderTime = getOrderDayTime(order);
        if (fromTime !== null && orderTime < fromTime) return false;
        if (toTime !== null && orderTime > toTime) return false;
        return true;
    });

    const sorted = [...filtered].sort((a, b) => {
        switch (query.sort) {
            case "oldest":
                return new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime();
            case "priority":
                return b.priorityMark - a.priorityMark;
            case "amount":
                return b.paymentAmount - a.paymentAmount;
            case "cod":
                return b.codAmount - a.codAmount;
            case "newest":
            default:
                return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime();
        }
    });

    const totalPages = Math.max(1, Math.ceil(sorted.length / query.pageSize));
    const page = Math.min(query.page, totalPages);
    const start = (page - 1) * query.pageSize;
    const pageRows = sorted.slice(start, start + query.pageSize);

    return {
        orders: sorted,
        allFilteredRows: sorted,
        pageRows,
        summary: buildOrderListSummary(sorted),
        page,
        pageSize: query.pageSize,
        totalPages
    };
}

const selectOrders = (state: RootState) => state.order.orders || [];
const selectCustomers = (state: RootState) => state.customer.customers || [];
const selectDoneOrders = (state: RootState) => state.order.doneOrders || [];

export const selectOrderListReadModel = createSelector(
    [selectOrders, selectCustomers, selectDoneOrders, (_state: RootState, query: Partial<OrderListQuery>) => query],
    (orders, customers, doneOrders, query) => buildOrderListReadModel({orders, customers, doneOrders, query})
);

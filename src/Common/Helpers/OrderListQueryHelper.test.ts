import {
    DEFAULT_ORDER_LIST_QUERY,
    hasActiveOrderListFilters,
    isDefaultOrderListQuery,
    mergeOrderListQuery,
    parseOrderListQuery,
    serializeOrderListQuery
} from "./OrderListQueryHelper";
import {ORDER_STATUS} from "@common/Constants/AppConstants";

describe("OrderListQueryHelper", () => {
    it("parses all supported URL params into a complete query", () => {
        const query = parseOrderListQuery("?q=alice&status=SHIPPED,RETURNED&cod=unpaid&ship=has-code&from=2026-06-01&to=2026-06-17&sort=cod&page=2");

        expect(query).toEqual({
            ...DEFAULT_ORDER_LIST_QUERY,
            text: "alice",
            statuses: [ORDER_STATUS.SHIPPED, ORDER_STATUS.RETURNED],
            codState: "unpaid",
            shippingState: "has-code",
            dateFrom: "2026-06-01",
            dateTo: "2026-06-17",
            sort: "cod",
            page: 2
        });
    });

    it("serializes non-default values and omits defaults", () => {
        expect(serializeOrderListQuery(DEFAULT_ORDER_LIST_QUERY).toString()).toBe("");

        const serialized = serializeOrderListQuery({
            ...DEFAULT_ORDER_LIST_QUERY,
            text: "bob",
            statuses: [ORDER_STATUS.SHIPPED, ORDER_STATUS.RETURNED],
            codState: "paid",
            shippingState: "done-order",
            dateFrom: "2026-06-01",
            dateTo: "2026-06-17",
            sort: "amount",
            page: 3
        });

        expect(serialized.toString()).toBe("q=bob&status=SHIPPED%2CRETURNED&cod=paid&ship=done-order&from=2026-06-01&to=2026-06-17&sort=amount&page=3");
    });

    it("sanitizes invalid option and page params back to defaults", () => {
        const query = parseOrderListQuery("?cod=bad&ship=bad&sort=bad&page=-10&status=SHIPPED,,RETURNED");

        expect(query.codState).toBe(DEFAULT_ORDER_LIST_QUERY.codState);
        expect(query.shippingState).toBe(DEFAULT_ORDER_LIST_QUERY.shippingState);
        expect(query.sort).toBe(DEFAULT_ORDER_LIST_QUERY.sort);
        expect(query.page).toBe(1);
        expect(query.statuses).toEqual([ORDER_STATUS.SHIPPED, ORDER_STATUS.RETURNED]);
    });

    it("merges patches and resets page when filters change", () => {
        const pageTwo = {...DEFAULT_ORDER_LIST_QUERY, page: 2};

        expect(mergeOrderListQuery(pageTwo, {text: "alice"}, {resetPage: true})).toEqual({
            ...DEFAULT_ORDER_LIST_QUERY,
            text: "alice",
            page: 1
        });
        expect(mergeOrderListQuery(pageTwo, {page: 3}, {resetPage: false}).page).toBe(3);
    });

    it("detects default and active-filter states", () => {
        expect(isDefaultOrderListQuery(DEFAULT_ORDER_LIST_QUERY)).toBe(true);
        expect(hasActiveOrderListFilters(DEFAULT_ORDER_LIST_QUERY)).toBe(false);
        expect(hasActiveOrderListFilters({...DEFAULT_ORDER_LIST_QUERY, statuses: [ORDER_STATUS.SHIPPED]})).toBe(true);
        expect(hasActiveOrderListFilters({...DEFAULT_ORDER_LIST_QUERY, page: 2})).toBe(false);
    });
});

import {Order} from "@store/Models/Order";

export type OrderActionKey =
    "mark-as-done" |
    "mark-as-payed-cod" |
    "refuse-to-receive" |
    "broken-items" |
    "waiting-return-order" |
    "returned-order" |
    "input-shipping-code" |
    "create-delivery-bill-helpers" |
    "place-items" |
    "priority" |
    "file-attachment" |
    "order-bill" |
    "customer-info" |
    "refund" |
    "delete";

export type OrderActionGroupKey = "delivery" | "details" | "customer" | "danger";

export type OrderActionFlags = {
    isPushedTrello: boolean;
    canMarkAsShipped: boolean;
    canMarkAsPayCOD: boolean;
    canMarkAsWaitingForReturn: boolean;
    canMarkAsReturned: boolean;
    isRefuseToReceive: boolean;
    isBrokenItems: boolean;
    hasShippingCode: boolean;
    doneInTrello: boolean;
}

export type OrderActionDefinition = {
    key: OrderActionKey;
    label: string;
    group: OrderActionGroupKey;
    isPrimary?: boolean;
    requiresConfirmation?: boolean;
    danger?: boolean;
    disabled?: boolean;
    disabledReason?: string;
}

export type OrderActionModel = {
    primaryAction?: OrderActionDefinition;
    actions: OrderActionDefinition[];
    groups: Record<OrderActionGroupKey, OrderActionDefinition[]>;
}

const GROUPS: OrderActionGroupKey[] = ["delivery", "details", "customer", "danger"];

const ACTIONS: Omit<OrderActionDefinition, "disabled" | "disabledReason" | "isPrimary">[] = [
    {key: "input-shipping-code", label: "Mã vận đơn", group: "delivery"},
    {key: "mark-as-done", label: "Đã giao hàng", group: "delivery"},
    {key: "mark-as-payed-cod", label: "Đã trả COD", group: "delivery", requiresConfirmation: true},
    {key: "waiting-return-order", label: "Chờ chuyển hoàn", group: "delivery"},
    {key: "create-delivery-bill-helpers", label: "Hỗ trợ nhập đơn", group: "delivery"},
    {key: "place-items", label: "Danh sách hàng", group: "details"},
    {key: "priority", label: "Độ ưu tiên", group: "details"},
    {key: "file-attachment", label: "Ảnh đính kèm", group: "details"},
    {key: "order-bill", label: "Vận chuyển", group: "details"},
    {key: "customer-info", label: "Thông tin khách hàng", group: "customer"},
    {key: "refund", label: "Hoàn tiền khách", group: "customer"},
    {key: "refuse-to-receive", label: "Bom hàng", group: "danger", danger: true, requiresConfirmation: true},
    {key: "broken-items", label: "Hàng lỗi, hoàn về", group: "danger", danger: true, requiresConfirmation: true},
    {key: "returned-order", label: "Đã chuyển hoàn", group: "danger", danger: true, requiresConfirmation: true},
    {key: "delete", label: "Xoá đơn hàng", group: "danger", danger: true, requiresConfirmation: true}
];

const _getDisabledReason = (action: OrderActionKey, order: Order, flags: OrderActionFlags): string => {
    const hasShippingCode = flags.hasShippingCode || Boolean(order.shippingCode);

    switch (action) {
        case "input-shipping-code":
            if (!flags.isPushedTrello) return "Cần tạo thẻ Trello trước";
            if (hasShippingCode) return "Đơn đã có mã vận đơn";
            return "";
        case "mark-as-done":
            if (!flags.canMarkAsShipped) return "Chưa thể đánh dấu giao thành công";
            return "";
        case "mark-as-payed-cod":
            if (!flags.canMarkAsPayCOD) return "Chưa thể đánh dấu trả COD";
            return "";
        case "waiting-return-order":
            if (!flags.canMarkAsWaitingForReturn) return "Chưa thể chuyển sang chờ hoàn";
            return "";
        case "returned-order":
            if (!flags.canMarkAsReturned) return "Chưa thể đánh dấu đã chuyển hoàn";
            return "";
        case "refuse-to-receive":
            if (flags.isRefuseToReceive) return "Đơn đã được đánh dấu bom hàng";
            return "";
        case "broken-items":
            if (flags.isBrokenItems) return "Đơn đã được đánh dấu hàng lỗi";
            return "";
        default:
            return "";
    }
}

const _selectPrimaryActionKey = (order: Order, flags: OrderActionFlags): OrderActionKey | undefined => {
    const hasShippingCode = flags.hasShippingCode || Boolean(order.shippingCode);

    if (flags.isPushedTrello && !hasShippingCode) return "input-shipping-code";
    if (flags.canMarkAsShipped || flags.doneInTrello) return "mark-as-done";
    if (flags.canMarkAsPayCOD) return "mark-as-payed-cod";
    if (flags.canMarkAsWaitingForReturn) return "waiting-return-order";
    if (flags.canMarkAsReturned) return "returned-order";
    return undefined;
}

export const buildOrderActionModel = (order: Order, flags: OrderActionFlags): OrderActionModel => {
    const primaryKey = _selectPrimaryActionKey(order, flags);
    const actions = ACTIONS.map(action => {
        const disabledReason = _getDisabledReason(action.key, order, flags);

        return {
            ...action,
            disabled: Boolean(disabledReason),
            disabledReason,
            isPrimary: action.key === primaryKey
        };
    });
    const primaryAction = actions.find(action => action.key === primaryKey && !action.disabled);
    const groups = GROUPS.reduce((result, group) => ({
        ...result,
        [group]: actions.filter(action => action.group === group)
    }), {} as Record<OrderActionGroupKey, OrderActionDefinition[]>);

    return {
        primaryAction,
        actions,
        groups
    };
}

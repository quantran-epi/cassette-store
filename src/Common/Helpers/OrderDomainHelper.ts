import {
    ORDER_PAYMENT_METHOD,
    ORDER_PRIORITY_STATUS,
    ORDER_RETURN_REASON,
    ORDER_STATUS
} from "@common/Constants/AppConstants";
import {Order} from "@store/Models/Order";
import {Customer} from "@store/Models/Customer";
import {OrderItem} from "@store/Models/OrderItem";
import {OrderHelper} from "@common/Helpers/OrderHelper";

export const ORDER_TRELLO_LABEL_KEYS = {
    VIP: "VIP",
    URGENT: "URGENT",
    PRIORITY: "PRIORITY",
    BANK_TRANSFER_IN_ADVANCE: "BANK_TRANSFER_IN_ADVANCE",
    CUSTOMER_RETURN_LESS_THAN_4: "CUSTOMER_RETURN_LESS_THAN_4"
} as const;

export type OrderTrelloLabelKey = typeof ORDER_TRELLO_LABEL_KEYS[keyof typeof ORDER_TRELLO_LABEL_KEYS];

export type OrderTransitionResult = {
    order: Order;
    customer: Customer;
}

export type ChangeShippingCodeTransitionResult = OrderTransitionResult & {
    isFirstShippingCode: boolean;
}

const _copyOrder = (order: Order): Order => ({...order});

const _copyCustomer = (customer: Customer): Customer => ({...customer});

export const OrderDomainHelper = {
    buildOrderTrelloDescription: (order: Order, customer: Customer): string => {
        return `${customer.name}\n${customer.mobile}\n${customer.address}\n${order.placedItems.map(item => `${item.count} băng ${item.type}\n`)}\nThu ${order.codAmount.toLocaleString()}đ\n${order.note}`;
    },

    calculateOrderPaymentAmountFromCustomer: (placedItems: OrderItem[], customer: Customer, isFreeShip?: boolean): number => {
        return OrderHelper.calculateTotalOrderItemsAmount(placedItems) + (Boolean(isFreeShip) ? 0 : OrderHelper.getShippingAmountByArea(customer.area));
    },

    getAutoCODAmount: (paymentMethod: string, paymentAmount: number): number => {
        return paymentMethod === ORDER_PAYMENT_METHOD.BANK_TRANSFER_IN_ADVANCE ? 0 : paymentAmount;
    },

    getOrderTrelloLabelKeys: (order: Order, customer: Customer): OrderTrelloLabelKey[] => {
        let labelKeys: OrderTrelloLabelKey[] = [];
        if (OrderDomainHelper.isVipOrder(order, customer)) labelKeys.push(ORDER_TRELLO_LABEL_KEYS.VIP);
        if (OrderDomainHelper.isUrgent(order)) labelKeys.push(ORDER_TRELLO_LABEL_KEYS.URGENT);
        else if (OrderDomainHelper.isPriority(order)) labelKeys.push(ORDER_TRELLO_LABEL_KEYS.PRIORITY);
        if (OrderDomainHelper.isBankTransferInAdvance(order)) labelKeys.push(ORDER_TRELLO_LABEL_KEYS.BANK_TRANSFER_IN_ADVANCE);
        if (OrderDomainHelper.isCustomerReturnLessThan4(order, customer)) labelKeys.push(ORDER_TRELLO_LABEL_KEYS.CUSTOMER_RETURN_LESS_THAN_4);
        return labelKeys;
    },

    isVipOrder: (order: Order, customer: Customer): boolean => {
        return customer.isVIP;
    },

    isPriority: (order: Order): boolean => {
        return order.priorityStatus === ORDER_PRIORITY_STATUS.PRIORITY;
    },

    isUrgent: (order: Order): boolean => {
        return order.priorityStatus === ORDER_PRIORITY_STATUS.URGENT;
    },

    isCustomerReturnLessThan4: (order: Order, customer: Customer): boolean => {
        return customer.buyCount > 1 && customer.buyCount <= 4;
    },

    isBankTransferInAdvance: (order: Order): boolean => {
        return order.paymentMethod === ORDER_PAYMENT_METHOD.BANK_TRANSFER_IN_ADVANCE;
    },

    canMarkAsWaitingForReturn: (order: Order): boolean => {
        return Boolean(order) && order.status !== ORDER_STATUS.WAITING_FOR_RETURNED && order.status !== ORDER_STATUS.SHIPPED;
    },

    canMarkAsReturned: (order: Order): boolean => {
        return Boolean(order) && order.status !== ORDER_STATUS.RETURNED && order.status !== ORDER_STATUS.SHIPPED;
    },

    canMarkAsShipped: (order: Order): boolean => {
        return Boolean(order) && order.status !== ORDER_STATUS.SHIPPED;
    },

    canMarkAsPayCOD: (order: Order): boolean => {
        return Boolean(order) && order.isPayCOD === false;
    },

    markOrderAsShippedTransition: (order: Order, customer: Customer): OrderTransitionResult => {
        let updatedOrder = _copyOrder(order);
        let updatedCustomer = _copyCustomer(customer);
        updatedOrder.status = ORDER_STATUS.SHIPPED;
        updatedOrder.returnReason = null;
        updatedCustomer.buyCount += 1;
        updatedCustomer.buyAmount += updatedOrder.paymentAmount;
        if ((updatedCustomer.buyCount > 4 && updatedCustomer.buyAmount >= 2000000) || updatedCustomer.buyAmount >= 3000000) updatedCustomer.isVIP = true;
        return {order: updatedOrder, customer: updatedCustomer};
    },

    markOrderAsRefuseToReceiveTransition: (order: Order, customer: Customer): OrderTransitionResult => {
        let updatedOrder = _copyOrder(order);
        let updatedCustomer = _copyCustomer(customer);
        updatedOrder.status = ORDER_STATUS.WAITING_FOR_RETURNED;
        updatedOrder.returnReason = ORDER_RETURN_REASON.REFUSE_TO_RECEIVE;
        updatedCustomer.isInBlacklist = true;
        updatedCustomer.isVIP = false;
        return {order: updatedOrder, customer: updatedCustomer};
    },

    markOrderAsBrokenItemsTransition: (order: Order, customer: Customer): OrderTransitionResult => {
        let updatedOrder = _copyOrder(order);
        let updatedCustomer = _copyCustomer(customer);
        updatedOrder.status = ORDER_STATUS.WAITING_FOR_RETURNED;
        updatedOrder.returnReason = ORDER_RETURN_REASON.BROKEN_ITEMS;
        return {order: updatedOrder, customer: updatedCustomer};
    },

    markOrderAsWaitingForReturnTransition: (order: Order, customer: Customer): OrderTransitionResult => {
        let updatedOrder = _copyOrder(order);
        let updatedCustomer = _copyCustomer(customer);
        updatedOrder.status = ORDER_STATUS.WAITING_FOR_RETURNED;
        return {order: updatedOrder, customer: updatedCustomer};
    },

    markOrderAsReturnedTransition: (order: Order, customer: Customer): OrderTransitionResult => {
        let updatedOrder = _copyOrder(order);
        let updatedCustomer = _copyCustomer(customer);
        updatedOrder.status = ORDER_STATUS.RETURNED;
        return {order: updatedOrder, customer: updatedCustomer};
    },

    markOrderAsPayCODTransition: (order: Order, customer: Customer): OrderTransitionResult => {
        let updatedOrder = _copyOrder(order);
        let updatedCustomer = _copyCustomer(customer);
        updatedOrder.isPayCOD = true;
        return {order: updatedOrder, customer: updatedCustomer};
    },

    changeShippingCodeTransition: (order: Order, customer: Customer, code: string): ChangeShippingCodeTransitionResult => {
        let updatedOrder = _copyOrder(order);
        let updatedCustomer = _copyCustomer(customer);
        let isFirstShippingCode = !Boolean(updatedOrder.shippingCode);
        if (updatedOrder.status !== ORDER_STATUS.CREATE_DELIVERY) updatedOrder.status = ORDER_STATUS.CREATE_DELIVERY;
        updatedOrder.shippingCode = code;
        return {order: updatedOrder, customer: updatedCustomer, isFirstShippingCode};
    },

    refundTransition: (order: Order, customer: Customer, amount: number): OrderTransitionResult => {
        let updatedOrder = _copyOrder(order);
        let updatedCustomer = _copyCustomer(customer);
        updatedOrder.isRefund = amount > 0;
        updatedOrder.refundAmount = amount;
        return {order: updatedOrder, customer: updatedCustomer};
    }
}

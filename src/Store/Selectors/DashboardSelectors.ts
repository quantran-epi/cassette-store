import {createSelector} from "@reduxjs/toolkit";
import {COLORS, ORDER_PAYMENT_METHOD, ORDER_RETURN_REASON, ORDER_STATUS} from "@common/Constants/AppConstants";
import type {Customer} from "@store/Models/Customer";
import type {Order} from "@store/Models/Order";
import type {RootState} from "@store/Store";

export type DashboardTotals = {
    orderCount: number;
    bankTransferAmount: number;
    bankTransferOrderCount: number;
    totalCodAmount: number;
    totalCodNetAmount: number;
    totalShippingCost: number;
    codOrderCount: number;
    codPaidAmount: number;
    codUnpaidShippedAmount: number;
    codNotShippedAmount: number;
    refuseToReceiveOrderCount: number;
    refuseToReceiveCassetteCount: number;
    refuseToReceiveShippingCost: number;
    shippingFeeInterest: number;
    actualInterest: number;
}

export type CustomerDashboardItem = {
    customer: Customer;
    buyAmount: number;
    color?: string;
}

export type CustomerDashboardSummary = {
    repeatSecondPurchaseCount: number;
    repeatThreePlusPurchaseCount: number;
    vipCount: number;
    blacklistCount: number;
    topByAmount: CustomerDashboardItem[];
    topByBuyCount: CustomerDashboardItem[];
}

export type DashboardDecisionMetric = {
    key: string;
    label: string;
    value: number;
    suffix?: string;
    color?: string;
}

export type DashboardDecisionGroup = {
    key: string;
    title: string;
    description: string;
    metrics: DashboardDecisionMetric[];
}

export type DashboardDecisionGroups = {
    codToReconcile: DashboardDecisionGroup;
    shippingAttention: DashboardDecisionGroup;
    cashHealth: DashboardDecisionGroup;
    customerFollowUp: DashboardDecisionGroup;
    returnAttention: DashboardDecisionGroup;
}

export type DashboardReadModel = {
    totals: DashboardTotals;
    customers: CustomerDashboardSummary;
    decisionGroups: DashboardDecisionGroups;
}

const sumOrderItems = (order: Order, multiplier = 1): number => {
    return (order.placedItems || []).reduce((total, item) => total + (item.count * item.unitPrice * multiplier), 0);
}

export const getCustomerDashboardColor = (customer: Customer): string | undefined => {
    if (customer.isVIP) return COLORS.CUSTOMER.VIP;
    if (customer.buyCount > 3) return COLORS.CUSTOMER.BUY_MUTIPLE_TIMES;
    if (customer.buyCount > 0) return COLORS.CUSTOMER.CONFIRMED;
    return undefined;
}

export const getShippedCustomerBuyAmount = (orders: Order[], customerId: string): number => {
    return (orders || [])
        .filter(order => order.status === ORDER_STATUS.SHIPPED && order.customerId === customerId)
        .reduce((total, order) => total + order.paymentAmount, 0);
}

const buildDashboardDecisionGroups = (totals: DashboardTotals, customers: CustomerDashboardSummary): DashboardDecisionGroups => ({
    codToReconcile: {
        key: "codToReconcile",
        title: "COD cần đối soát",
        description: "Theo dõi COD đã nhận, chưa nhận và các đơn chưa giao xong.",
        metrics: [
            {key: "codPaidAmount", label: "COD đã trả", value: totals.codPaidAmount, suffix: "đ", color: COLORS.ORDER_STATUS.SHIPPED},
            {key: "codUnpaidShippedAmount", label: "Đã giao chưa trả COD", value: totals.codUnpaidShippedAmount, suffix: "đ", color: COLORS.ORDER_STATUS.WAITING_FOR_RETURNED},
            {key: "codNotShippedAmount", label: "COD chưa giao xong", value: totals.codNotShippedAmount, suffix: "đ"},
            {key: "totalCodNetAmount", label: "COD ròng dự kiến", value: totals.totalCodNetAmount, suffix: "đ"}
        ]
    },
    shippingAttention: {
        key: "shippingAttention",
        title: "Cần xử lý giao hàng",
        description: "Ưu tiên kiểm tra đơn COD chưa giao và chi phí vận chuyển.",
        metrics: [
            {key: "codOrderCount", label: "Đơn COD", value: totals.codOrderCount},
            {key: "orderCount", label: "Tổng đơn", value: totals.orderCount},
            {key: "codNotShippedAmount", label: "COD chưa giao xong", value: totals.codNotShippedAmount, suffix: "đ"},
            {key: "totalShippingCost", label: "Tổng phí ship", value: totals.totalShippingCost, suffix: "đ", color: COLORS.ORDER_STATUS.RETURNED}
        ]
    },
    cashHealth: {
        key: "cashHealth",
        title: "Dòng tiền",
        description: "Theo dõi tiền chuyển khoản, COD và lãi dự kiến.",
        metrics: [
            {key: "bankTransferAmount", label: "Chuyển khoản", value: totals.bankTransferAmount, suffix: "đ", color: COLORS.PAYMENT_METHOD.BANK_TRANSFER_IN_ADVANCE},
            {key: "totalCodAmount", label: "Tổng COD", value: totals.totalCodAmount, suffix: "đ", color: COLORS.ORDER_STATUS.SHIPPED},
            {key: "shippingFeeInterest", label: "Lãi phí ship", value: totals.shippingFeeInterest, suffix: "đ"},
            {key: "actualInterest", label: "Lãi dự kiến", value: totals.actualInterest, suffix: "đ", color: COLORS.ORDER_STATUS.SHIPPED}
        ]
    },
    customerFollowUp: {
        key: "customerFollowUp",
        title: "Khách hàng cần theo dõi",
        description: "Nhìn nhanh nhóm mua lại, VIP và khách bom.",
        metrics: [
            {key: "repeatSecondPurchaseCount", label: "Mua lại lần 2", value: customers.repeatSecondPurchaseCount, color: COLORS.CUSTOMER.CONFIRMED},
            {key: "repeatThreePlusPurchaseCount", label: "Mua lại 3+ lần", value: customers.repeatThreePlusPurchaseCount, color: COLORS.CUSTOMER.CONFIRMED},
            {key: "vipCount", label: "VIP", value: customers.vipCount, color: COLORS.CUSTOMER.VIP},
            {key: "blacklistCount", label: "Bom", value: customers.blacklistCount, color: COLORS.CUSTOMER.BLACK_LIST}
        ]
    },
    returnAttention: {
        key: "returnAttention",
        title: "Đơn hoàn/bom",
        description: "Theo dõi số đơn bom, số băng và phí ship mất.",
        metrics: [
            {key: "refuseToReceiveOrderCount", label: "Số đơn", value: totals.refuseToReceiveOrderCount, color: COLORS.ORDER_STATUS.RETURNED},
            {key: "refuseToReceiveCassetteCount", label: "Số băng", value: totals.refuseToReceiveCassetteCount, color: COLORS.ORDER_STATUS.RETURNED},
            {key: "refuseToReceiveShippingCost", label: "Tiền ship", value: totals.refuseToReceiveShippingCost, suffix: "đ", color: COLORS.ORDER_STATUS.RETURNED}
        ]
    }
});

export const buildDashboardReadModel = (orders: Order[], customers: Customer[]): DashboardReadModel => {
    const orderList = orders || [];
    const customerList = customers || [];
    const paidOrBankTransferOrders = orderList.filter(order =>
        (order.status === ORDER_STATUS.SHIPPED && order.isPayCOD === true)
        || order.paymentMethod === ORDER_PAYMENT_METHOD.BANK_TRANSFER_IN_ADVANCE
    );
    const totalShippingCost = orderList.reduce((total, order) => total + order.shippingCost, 0);
    const shippingFeeInterest = paidOrBankTransferOrders
        .reduce((total, order) => total + (order.paymentAmount - sumOrderItems(order)), 0)
        - totalShippingCost;
    const refuseOrders = orderList.filter(order =>
        (order.status === ORDER_STATUS.RETURNED || order.status === ORDER_STATUS.WAITING_FOR_RETURNED)
        && order.returnReason === ORDER_RETURN_REASON.REFUSE_TO_RECEIVE
    );
    const customerItems = customerList.map<CustomerDashboardItem>(customer => ({
        customer,
        buyAmount: getShippedCustomerBuyAmount(orderList, customer.id),
        color: getCustomerDashboardColor(customer)
    }));

    const totals: DashboardTotals = {
        orderCount: orderList.length,
        bankTransferAmount: orderList
            .filter(order => order.paymentMethod === ORDER_PAYMENT_METHOD.BANK_TRANSFER_IN_ADVANCE)
            .reduce((total, order) => total + order.paymentAmount, 0),
        bankTransferOrderCount: orderList.filter(order => order.paymentMethod === ORDER_PAYMENT_METHOD.BANK_TRANSFER_IN_ADVANCE).length,
        totalCodAmount: orderList.reduce((total, order) => total + order.codAmount, 0),
        totalCodNetAmount: orderList.reduce((total, order) => total + (order.codAmount - order.shippingCost), 0),
        totalShippingCost,
        codOrderCount: orderList.filter(order => order.codAmount !== 0).length,
        codPaidAmount: orderList
            .filter(order => order.isPayCOD === true)
            .reduce((total, order) => total + (order.codAmount - order.shippingCost), 0),
        codUnpaidShippedAmount: orderList
            .filter(order => order.paymentMethod === ORDER_PAYMENT_METHOD.CASH_COD && order.status === ORDER_STATUS.SHIPPED && order.isPayCOD === false)
            .reduce((total, order) => total + (order.codAmount - order.shippingCost), 0),
        codNotShippedAmount: orderList
            .filter(order => order.paymentMethod === ORDER_PAYMENT_METHOD.CASH_COD && order.status !== ORDER_STATUS.SHIPPED)
            .reduce((total, order) => total + (order.codAmount - order.shippingCost), 0),
        refuseToReceiveOrderCount: refuseOrders.length,
        refuseToReceiveCassetteCount: refuseOrders.reduce((total, order) => total + sumOrderItems(order, 0) + (order.placedItems || []).reduce((count, item) => count + item.count, 0), 0),
        refuseToReceiveShippingCost: refuseOrders.reduce((total, order) => total + order.shippingCost, 0),
        shippingFeeInterest,
        actualInterest: paidOrBankTransferOrders.reduce((total, order) => total + sumOrderItems(order, 0.6), 0) + shippingFeeInterest
    };
    const customerSummary: CustomerDashboardSummary = {
        repeatSecondPurchaseCount: customerList.filter(customer => customer.buyCount === 2).length,
        repeatThreePlusPurchaseCount: customerList.filter(customer => customer.buyCount > 2).length,
        vipCount: customerList.filter(customer => customer.isVIP).length,
        blacklistCount: customerList.filter(customer => customer.isInBlacklist).length,
        topByAmount: [...customerItems].sort((a, b) => b.buyAmount - a.buyAmount).slice(0, 10),
        topByBuyCount: [...customerItems].sort((a, b) => b.customer.buyCount - a.customer.buyCount).slice(0, 10)
    };

    return {
        totals,
        customers: customerSummary,
        decisionGroups: buildDashboardDecisionGroups(totals, customerSummary)
    };
}

const selectOrders = (state: RootState) => state.order.orders || [];
const selectCustomers = (state: RootState) => state.customer.customers || [];

export const selectDashboardReadModel = createSelector(
    [selectOrders, selectCustomers],
    (orders, customers) => buildDashboardReadModel(orders, customers)
);

import {createSelector} from "@reduxjs/toolkit";
import {COLORS, ORDER_PAYMENT_METHOD, ORDER_RETURN_REASON, ORDER_STATUS} from "@common/Constants/AppConstants";
import type {Customer} from "@store/Models/Customer";
import type {Order} from "@store/Models/Order";
import type {RootState} from "@store/Store";

export type DashboardTotals = {
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

export type DashboardReadModel = {
    totals: DashboardTotals;
    customers: CustomerDashboardSummary;
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

    return {
        totals: {
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
        },
        customers: {
            repeatSecondPurchaseCount: customerList.filter(customer => customer.buyCount === 2).length,
            repeatThreePlusPurchaseCount: customerList.filter(customer => customer.buyCount > 2).length,
            vipCount: customerList.filter(customer => customer.isVIP).length,
            blacklistCount: customerList.filter(customer => customer.isInBlacklist).length,
            topByAmount: [...customerItems].sort((a, b) => b.buyAmount - a.buyAmount).slice(0, 10),
            topByBuyCount: [...customerItems].sort((a, b) => b.customer.buyCount - a.customer.buyCount).slice(0, 10)
        }
    };
}

const selectOrders = (state: RootState) => state.order.orders || [];
const selectCustomers = (state: RootState) => state.customer.customers || [];

export const selectDashboardReadModel = createSelector(
    [selectOrders, selectCustomers],
    (orders, customers) => buildDashboardReadModel(orders, customers)
);

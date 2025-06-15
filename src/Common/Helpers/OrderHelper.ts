import {
    CUSTOMER_AREAS,
    CUSTOMER_DIFFUCULTIES,
    ORDER_ITEM_TYPE,
    ORDER_PAYMENT_METHOD
} from "@common/Constants/AppConstants"
import {Order} from "@store/Models/Order"
import {OrderItem} from "@store/Models/OrderItem"
import {nanoid} from "nanoid"
import {Customer} from "@store/Models/Customer";

export const OrderHelper = {
    createNewEmptyOrderItem: (orderName: string, useDefault: boolean, defaultCount: number = 5, defaultType: string = Object.keys(ORDER_ITEM_TYPE)[0], defaultPrice: number = ORDER_ITEM_TYPE["SONY-50K"]): OrderItem => {
        if (useDefault)
            return {
                id: orderName + nanoid(5),
                count: defaultCount,
                type: defaultType,
                unitPrice: defaultPrice,
                note: ""
            }
        return {
            id: orderName + nanoid(5),
            count: undefined,
            type: undefined,
            unitPrice: null,
            note: ""
        }
    },
    calculatePendingOrderPrioritymark: (order: Order, customer: Customer): number => {
        let markByDate = 0;
        let markByArea: number = 0;
        let markByDifficulty: number = 0;
        let markByCustomerRank: number = 0;
        let markByPaymentMethod: number = 0;
        let markByOrderAmount: number = 0;

        // by date
        const now = new Date();
        // @ts-ignore
        const diffDays = Math.floor((now.getTime() - new Date(order.createdDate).getTime()) / (1000 * 60 * 60 * 24));
        const maxDays = 30; // sau 30 ngày thì trọng số đạt max
        const minWeight = 1;
        const maxWeight = 5;
        const clampedDays = Math.min(diffDays, maxDays);
        const weight = minWeight + ((maxWeight - minWeight) * clampedDays / maxDays);
        markByDate = parseFloat(weight.toFixed(2));

        // by area
        switch (customer.area) {
            case CUSTOMER_AREAS[0]:
                markByArea = 0;
                break;
            case CUSTOMER_AREAS[1]:
                markByArea = 0.2;
                break;
            case CUSTOMER_AREAS[2]:
                markByArea = 0.4;
                break;
            case CUSTOMER_AREAS[3]:
                markByArea = 0.6;
                break;
            case CUSTOMER_AREAS[4]:
                markByArea = 0.8;
                break;
            case CUSTOMER_AREAS[5]:
                markByArea = 0.9;
                break;
        }

        // by difficulty
        switch (customer.difficulty) {
            case CUSTOMER_DIFFUCULTIES[0]:
                markByDifficulty = 0.4;
                break;
            case CUSTOMER_DIFFUCULTIES[1]:
                markByDifficulty = 0.2;
                break;
            case CUSTOMER_DIFFUCULTIES[2]:
                markByDifficulty = 0;
                break;
        }

        // by customer rank
        if (customer.isVIP) markByCustomerRank = 10;
        else {
            if (customer.buyCount > 0 && customer.buyCount < 3) markByCustomerRank += 1;
            else if (customer.buyCount >= 3 && customer.buyCount < 5) markByCustomerRank += 3;
            else if (customer.buyCount >= 5) markByCustomerRank = +4;

            if (customer.buyAmount == 0) markByCustomerRank += 0;
            else if (customer.buyAmount > 0 && customer.buyAmount <= 150000) markByCustomerRank += 0.2;
            else if (customer.buyAmount > 150000 && customer.buyAmount < 300000) markByCustomerRank += 0.3;
            else if (customer.buyCount >= 300000 && customer.buyAmount < 500000) markByCustomerRank += 0.5;
            else if (customer.buyAmount >= 500000) markByCustomerRank += 1;
        }

        // payment method
        if (order.paymentMethod === ORDER_PAYMENT_METHOD.BANK_TRANSFER_IN_ADVANCE) markByPaymentMethod += 3;

        // order amount
        let amount = order.placedItems.reduce((prev, cur) => {
            return prev + (cur.unitPrice * cur.count);
        }, 0)
        if (amount >= 250000 && amount < 300000) markByOrderAmount += 0.3;
        else if (amount >= 300000 && amount < 500000) markByOrderAmount += 0.5;
        else if (amount >= 500000) markByOrderAmount += 1;

        return markByDate + markByArea + markByDifficulty + markByCustomerRank + markByPaymentMethod + markByOrderAmount;
    },
    calculateTotalOrderItemsAmount: (items: OrderItem[]):number => {
        return items.reduce((prev, cur) => prev + (cur.count * cur.unitPrice || 0), 0);
    },
    getShippingAmountByArea: (area: string):number => {
        if(area === CUSTOMER_AREAS[0]) return 20000;
        else if ([CUSTOMER_AREAS[1], CUSTOMER_AREAS[2], CUSTOMER_AREAS[3]]) return 25000;
        else return 30000;
    }
}
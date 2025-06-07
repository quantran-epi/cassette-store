import {OrderItem} from "@store/Models/OrderItem";

export type Order = {
    id: string;
    sequence: number;
    createdDate: Date;
    name: string;
    placedItems: OrderItem[];
    changeItems: ChangeItem[];
    status: string; //ORDER_STATUS
    shippingCost: number;
    returnReason: string; //ORDER_RETURN_REASON
    isRefund: boolean;
    refundAmount: number;
    paymentMethod: string; //ORDER_PAYMENT_METHOD
    shippingPartner: string; //ORDER_SHIPPING_PARTNER,
    shippingCode: string;
    codAmount: number;
    priorityMark: number;
    priorityStatus: string; //ORDER_PRIORITY_STATUS
    dueDate: Date;
    customerId: string;
}

export type ChangeItem = {
    id: string;
    count: number;
    note: string;
    createdDate: Date;
}
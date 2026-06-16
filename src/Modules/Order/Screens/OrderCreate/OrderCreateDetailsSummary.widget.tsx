import {
    ORDER_DEFAULT_SHIPPING_COST,
    ORDER_PAYMENT_METHOD,
    ORDER_PRIORITY_STATUS,
    ORDER_SHIPPING_PARTNER
} from "@common/Constants/AppConstants";
import {Tag} from "@components/Tag";
import {Space} from "@components/Layout/Space";
import {Typography} from "@components/Typography";
import React, {FunctionComponent} from "react";

type OrderCreateDetailsValues = {
    priorityStatus?: string;
    isFreeShip?: boolean;
    shippingPartner?: string;
    paymentMethod?: string;
    paymentAmount?: number;
    codAmount?: number;
    shippingCost?: number;
    dueDate?: Date;
    important?: string;
}

type OrderCreateDetailsSummaryWidgetProps = {
    values: OrderCreateDetailsValues;
}

export const OrderCreateDetailsSummaryWidget: FunctionComponent<OrderCreateDetailsSummaryWidgetProps> = ({values}) => {
    const changedFields = [
        values.priorityStatus && values.priorityStatus !== ORDER_PRIORITY_STATUS.NONE ? "Ưu tiên" : null,
        values.isFreeShip ? "Miễn phí vận chuyển" : null,
        values.shippingPartner && values.shippingPartner !== ORDER_SHIPPING_PARTNER.VNPOST ? "Đơn vị vận chuyển" : null,
        values.paymentMethod && values.paymentMethod !== ORDER_PAYMENT_METHOD.CASH_COD ? "Thanh toán" : null,
        values.codAmount !== undefined && values.codAmount !== null && values.codAmount !== values.paymentAmount ? "COD" : null,
        values.shippingCost !== undefined && values.shippingCost !== ORDER_DEFAULT_SHIPPING_COST ? "Phí vận chuyển" : null,
        values.dueDate ? "Ngày hẹn" : null,
        values.important ? "Thông tin quan trọng" : null,
    ].filter(Boolean);

    if (changedFields.length === 0) return <Typography.Text type="secondary" style={{fontSize: 14}}>Mặc định</Typography.Text>;

    return <Space size={4} wrap>
        <Typography.Text type="secondary" style={{fontSize: 14}}>Đã đổi:</Typography.Text>
        {changedFields.map(field => <Tag key={field}>{field}</Tag>)}
    </Space>
}

import {RootRoutes} from "@routing/RootRoutes";
import {Navigate} from "react-router-dom";
import React from "react";
import {useOrder, useScreenTitle} from "@hooks";
import moment from "moment";
import {Card} from "@components/Card";
import {Statistic} from "antd";
import {Stack} from "@components/Layout/Stack";
import {
    COLORS,
    ORDER_ITEM_TYPE,
    ORDER_PAYMENT_METHOD,
    ORDER_RETURN_REASON,
    ORDER_STATUS
} from "@common/Constants/AppConstants";
import {Divider} from "@components/Layout/Divider";
import {ArrowUpOutlined, ArrowDownOutlined} from "@ant-design/icons";
import {useSelector} from "react-redux";
import {RootState} from "@store/Store";
import {Col, Row} from "@components/Grid";

moment.updateLocale('en', {week: {dow: 1}});

export const DashboardScreen = () => {
    const orders = useSelector((state: RootState) => state.order.orders);
    const {} = useScreenTitle({value: "Thống kê", deps: []});
    const orderUtils = useOrder();

    return <React.Fragment>
        <Divider>Thống kê số tiền, số băng</Divider>
        <Card bordered={false} title={"Tổng"}>
            <Stack fullwidth direction={"column"} align={"flex-start"}>
                <Statistic
                    title="Tổng COD"
                    value={orders.reduce((prev, cur) => prev + cur.codAmount, 0)}
                    suffix="đ"
                    valueStyle={{color: COLORS.ORDER_STATUS.SHIPPED}}
                />
                <Statistic
                    title="Tổng chuyển khoản"
                    value={orders.filter(e => e.paymentMethod === ORDER_PAYMENT_METHOD.BANK_TRANSFER_IN_ADVANCE).reduce((prev, cur) => prev + cur.paymentAmount, 0)}
                    suffix="đ"
                    valueStyle={{color: COLORS.ORDER_STATUS.SHIPPED}}
                />
                <Statistic
                    title="Tổng tiền đơn (số băng x đơn giá)"
                    value={orders.reduce((prev, cur) => prev + cur.placedItems.reduce((prev1, cur1) => prev1 + (cur1.count * cur1.unitPrice), 0), 0)}
                    suffix="đ"
                    valueStyle={{color: COLORS.ORDER_STATUS.SHIPPED}}
                />
                <Statistic
                    title="Tổng ship"
                    value={orders.reduce((prev, cur) => prev + cur.shippingCost, 0)}
                    suffix="đ"
                    valueStyle={{color: COLORS.ORDER_STATUS.RETURNED}}
                />
                <Statistic
                    title="Tổng số băng trên đơn"
                    value={orders.reduce((prev, cur) => prev + cur.placedItems.reduce((prev1, cur1) => prev1 + cur1.count, 0), 0)}
                    suffix=""
                    valueStyle={{color: COLORS.ORDER_STATUS.PAY_COD}}
                />
            </Stack>
        </Card>
        <br/>
        <Card bordered={false} title={"COD"}>
            <Stack fullwidth direction={"column"} align={"flex-start"}>
                <Statistic
                    title="Đã thu COD"
                    value={orders.filter(e => e.isPayCOD === true).reduce((prev, cur) => prev + cur.codAmount, 0)}
                    suffix="đ"
                    valueStyle={{color: COLORS.ORDER_STATUS.SHIPPED}}
                />
                <Statistic
                    title="Chưa thu COD (đã giao thành công)"
                    value={orders.filter(e => e.status === ORDER_STATUS.SHIPPED && e.isPayCOD === false).reduce((prev, cur) => prev + cur.codAmount, 0)}
                    suffix="đ"
                    valueStyle={{color: COLORS.ORDER_STATUS.WAITING_FOR_RETURNED}}
                />
                <Statistic
                    title="Chưa giao thành công"
                    value={orders.filter(e => e.status !== ORDER_STATUS.SHIPPED).reduce((prev, cur) => prev + cur.codAmount, 0)}
                    suffix="đ"
                    valueStyle={{color: COLORS.ORDER_STATUS.PAY_COD}}
                />
            </Stack>
        </Card>
        <br/>
        <Card bordered={false} title={"Bom"}>
            <Stack fullwidth direction={"column"} align={"flex-start"}>
                <Statistic
                    title="Số đơn"
                    value={orders.filter(e => e.status === ORDER_STATUS.RETURNED && e.returnReason === ORDER_RETURN_REASON.REFUSE_TO_RECEIVE).length}
                    suffix="đơn"
                    valueStyle={{color: COLORS.ORDER_STATUS.RETURNED}}
                />
                <Statistic
                    title="Số băng"
                    value={orders.filter(e => e.status === ORDER_STATUS.RETURNED && e.returnReason === ORDER_RETURN_REASON.REFUSE_TO_RECEIVE)
                        .reduce((prev, cur) => prev + cur.placedItems.reduce((prev1, cur1) => prev1 + cur1.count, 0), 0)}
                    suffix="băng"
                    valueStyle={{color: COLORS.ORDER_STATUS.RETURNED}}
                />
                <Statistic
                    title="Tiền ship"
                    value={orders.filter(e => e.status === ORDER_STATUS.RETURNED && e.returnReason === ORDER_RETURN_REASON.REFUSE_TO_RECEIVE)
                        .reduce((prev, cur) => prev + cur.shippingCost, 0)}
                    suffix="đ"
                    valueStyle={{color: COLORS.ORDER_STATUS.RETURNED}}
                />
            </Stack>
        </Card>
        <Divider>Thống kê loại băng</Divider>
        <Card bordered={false} title={"Số băng bán"}>
            <Stack fullwidth direction={"column"} align={"flex-start"}>
                {Object.keys(ORDER_ITEM_TYPE).map(key => <Statistic
                    title={key}
                    value={orders
                        .reduce((prev, cur) => prev + cur.placedItems.filter(c => c.type === key).reduce((prev1, cur1) => prev1 + cur1.count, 0), 0)}
                    suffix=""
                    valueStyle={{color: COLORS.ORDER_STATUS.SHIPPED}}
                />)}
            </Stack>
        </Card>
    </React.Fragment>
}
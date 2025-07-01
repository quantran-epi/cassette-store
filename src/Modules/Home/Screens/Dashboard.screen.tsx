import { RootRoutes } from "@routing/RootRoutes";
import { Navigate } from "react-router-dom";
import React from "react";
import { useOrder, useScreenTitle } from "@hooks";
import moment from "moment";
import { Card } from "@components/Card";
import { Statistic } from "antd";
import { Stack } from "@components/Layout/Stack";
import { COLORS } from "@common/Constants/AppConstants";
import { Divider } from "@components/Layout/Divider";
import { ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";

moment.updateLocale('en', { week: { dow: 1 } });

export const DashboardScreen = () => {
    const { } = useScreenTitle({ value: "Thống kê", deps: [] });
    const orderUtils = useOrder();

    const thisMonthFrom = moment().startOf('month');
    const thisMonthTo = moment().endOf('month');

    return <React.Fragment>
        <Card bordered={false} title={"Tổng số"}>
            <Stack fullwidth justify={"space-between"}>
                <Statistic
                    title="Số tiền bán"
                    value={orderUtils.getTotalAmountSoldAll()}
                    suffix="đ"
                    valueStyle={{ color: COLORS.ORDER_STATUS.SHIPPED }}
                />
                <Statistic
                    title="Số đơn bán"
                    value={orderUtils.getTotalOrderSoldAll()}
                    suffix="đơn"
                    valueStyle={{ color: COLORS.ORDER_STATUS.SHIPPED }}
                />
            </Stack>
            <Stack fullwidth justify={"space-between"}>
                <Statistic
                    title="Số tiền bom"
                    value={orderUtils.getTotalAmountBomAll()}
                    suffix="đ"
                    valueStyle={{ color: COLORS.ORDER_STATUS.RETURNED }}
                />
                <Statistic
                    title="Số đơn bom"
                    value={orderUtils.getTotalOrderBomAll()}
                    suffix="đơn"
                    valueStyle={{ color: COLORS.ORDER_STATUS.RETURNED }}
                />
            </Stack>
        </Card>
        <Card bordered={false} title={"Tháng này"}>
            <Stack fullwidth justify={"space-between"}>
                <Statistic
                    title="Số tiền bán"
                    value={orderUtils.getTotalAmountSold(thisMonthFrom.toDate(), thisMonthTo.toDate())}
                    suffix="đ"
                    valueStyle={{ color: COLORS.ORDER_STATUS.SHIPPED }}
                />
                <Statistic
                    title="Số đơn bán"
                    value={orderUtils.getTotalOrderSold(thisMonthFrom.toDate(), thisMonthTo.toDate())}
                    suffix="đơn"
                    valueStyle={{ color: COLORS.ORDER_STATUS.SHIPPED }}
                />
            </Stack>
            <Stack fullwidth justify={"space-between"}>
                <Statistic
                    title="Số tiền bom"
                    value={orderUtils.getTotalAmountBom(thisMonthFrom.toDate(), thisMonthTo.toDate())}
                    suffix="đ"
                    valueStyle={{ color: COLORS.ORDER_STATUS.RETURNED }}
                />
                <Statistic
                    title="Số đơn bom"
                    value={orderUtils.getTotalOrderBom(thisMonthFrom.toDate(), thisMonthTo.toDate())}
                    suffix="đơn"
                    valueStyle={{ color: COLORS.ORDER_STATUS.RETURNED }}
                />
            </Stack>
        </Card>
    </React.Fragment>
}
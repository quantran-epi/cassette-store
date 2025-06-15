import {RootRoutes} from "@routing/RootRoutes";
import {Navigate} from "react-router-dom";
import React from "react";
import {useOrder, useScreenTitle} from "@hooks";
import moment from "moment";
import {Card} from "@components/Card";
import {Statistic} from "antd";
import {Stack} from "@components/Layout/Stack";
import {COLORS} from "@common/Constants/AppConstants";
import {Divider} from "@components/Layout/Divider";
import {ArrowUpOutlined, ArrowDownOutlined} from "@ant-design/icons";

moment.updateLocale('en', {week: {dow: 1}});

export const DashboardScreen = () => {
    const {} = useScreenTitle({value: "Thống kê", deps: []});
    const orderUtils = useOrder();
    const thisWeekFrom = moment().startOf('week');
    const thisWeekTo = moment().endOf('week');

// Last week
    const lastWeekFrom = moment().subtract(1, 'week').startOf('week');
    const lastWeekTo = moment().subtract(1, 'week').endOf('week');

// This month
    const thisMonthFrom = moment().startOf('month');
    const thisMonthTo = moment().endOf('month');

// Last month
    const lastMonthFrom = moment().subtract(1, 'month').startOf('month');
    const lastMonthTo = moment().subtract(1, 'month').endOf('month');

    const _getCompareWeek = () => {
        let lastWeek = orderUtils.getTotalOrderSold(lastWeekFrom.toDate(), lastWeekTo.toDate()) === 0 ? 1 : orderUtils.getTotalOrderSold(lastWeekFrom.toDate(), lastWeekTo.toDate());
        return (orderUtils.getTotalOrderSold(thisWeekFrom.toDate(), thisWeekTo.toDate()) /
            lastWeek) * 100;
    }

    const _getCompareAmountWeek = () => {
        let lastWeek = orderUtils.getTotalAmountSold(lastWeekFrom.toDate(), lastWeekTo.toDate()) === 0 ? 1 : orderUtils.getTotalAmountSold(lastWeekFrom.toDate(), lastWeekTo.toDate());
        return (orderUtils.getTotalAmountSold(thisWeekFrom.toDate(), thisWeekTo.toDate()) /
            lastWeek) * 100;
    }

    const _getCompareMonth = () => {
        let lastMonth = orderUtils.getTotalOrderSold(lastMonthFrom.toDate(), lastMonthTo.toDate()) === 0 ? 1 : orderUtils.getTotalOrderSold(lastMonthFrom.toDate(), lastMonthTo.toDate());
        return (orderUtils.getTotalOrderSold(thisMonthFrom.toDate(), thisMonthTo.toDate()) /
            lastMonth) * 100;
    }

    const _getCompareAmountMonth = () => {
        let lastMonth = orderUtils.getTotalAmountSold(lastMonthFrom.toDate(), lastMonthTo.toDate()) === 0 ? 1 : orderUtils.getTotalAmountSold(lastMonthFrom.toDate(), lastMonthTo.toDate());
        return (orderUtils.getTotalAmountSold(thisMonthFrom.toDate(), thisMonthTo.toDate()) /
            lastMonth) * 100;
    }

    return <React.Fragment>
        <Divider>Thống kê chung</Divider>
        <Card bordered={false} title={"Tổng số từ trước đến hiện tại"}>
            <Stack fullwidth justify={"space-between"}>
                <Statistic
                    title="Số tiền bán"
                    value={orderUtils.getTotalAmountSoldAll()}
                    suffix="đ"
                    valueStyle={{color: COLORS.ORDER_STATUS.SHIPPED}}
                />
                <Statistic
                    title="Số đơn bán"
                    value={orderUtils.getTotalOrderSoldAll()}
                    suffix="đơn"
                    valueStyle={{color: COLORS.ORDER_STATUS.SHIPPED}}
                />
            </Stack>
            <Stack fullwidth justify={"space-between"}>
                <Statistic
                    title="Số tiền bom"
                    value={orderUtils.getTotalAmountBomAll()}
                    suffix="đ"
                    valueStyle={{color: COLORS.ORDER_STATUS.RETURNED}}
                />
                <Statistic
                    title="Số đơn bom"
                    value={orderUtils.getTotalOrderBomAll()}
                    suffix="đơn"
                    valueStyle={{color: COLORS.ORDER_STATUS.RETURNED}}
                />
            </Stack>
        </Card>
        <br/>
        <Card bordered={false} title={"Tăng trưởng"}>
            <Stack justify={"space-between"} wrap={"wrap"}>
                <Statistic
                    title="Số đơn bán tuần này"
                    value={_getCompareWeek()}
                    suffix="%"
                    precision={0}
                    prefix={_getCompareWeek() >= 0 ? <ArrowUpOutlined/> : <ArrowDownOutlined/>}
                    valueStyle={{color: _getCompareWeek() >= 0 ? COLORS.ORDER_STATUS.SHIPPED : COLORS.ORDER_STATUS.RETURNED}}
                />
                <Statistic
                    title="Số tiền bán tuần này"
                    value={_getCompareAmountWeek()}
                    suffix="%"
                    precision={0}
                    prefix={_getCompareAmountWeek() >= 0 ? <ArrowUpOutlined/> : <ArrowDownOutlined/>}
                    valueStyle={{color: _getCompareAmountWeek() >= 0 ? COLORS.ORDER_STATUS.SHIPPED : COLORS.ORDER_STATUS.RETURNED}}
                />
            </Stack>
            <Stack justify={"space-between"} wrap={"wrap"}>
                <Statistic
                    title="Số đơn bán tháng này"
                    value={_getCompareMonth()}
                    suffix="%"
                    precision={0}
                    prefix={_getCompareAmountMonth() >= 0 ? <ArrowUpOutlined/> : <ArrowDownOutlined/>}
                    valueStyle={{color: _getCompareAmountMonth() >= 0 ? COLORS.ORDER_STATUS.SHIPPED : COLORS.ORDER_STATUS.RETURNED}}
                />
                <Statistic
                    title="Số tiền bán tháng này"
                    value={_getCompareAmountMonth()}
                    suffix="%"
                    precision={0}
                    prefix={_getCompareAmountWeek() >= 0 ? <ArrowUpOutlined/> : <ArrowDownOutlined/>}
                    valueStyle={{color: _getCompareAmountWeek() >= 0 ? COLORS.ORDER_STATUS.SHIPPED : COLORS.ORDER_STATUS.RETURNED}}
                />
            </Stack>
        </Card>
        <Divider>Thống kê theo Tuần</Divider>
        <Card bordered={false} title={"Tuần này"}>
            <Stack fullwidth justify={"space-between"}>
                <Statistic
                    title="Số đơn bán"
                    value={orderUtils.getTotalOrderSold(thisWeekFrom.toDate(), thisWeekTo.toDate())}
                    suffix="đơn"
                    valueStyle={{color: COLORS.ORDER_STATUS.SHIPPED}}
                />
                <Statistic
                    title="Số tiền bán"
                    value={orderUtils.getTotalAmountSold(thisWeekFrom.toDate(), thisWeekTo.toDate())}
                    suffix="đ"
                    valueStyle={{color: COLORS.ORDER_STATUS.SHIPPED}}
                />
            </Stack>
            <Stack fullwidth justify={"space-between"}>
                <Statistic
                    title="Số đơn bom"
                    value={orderUtils.getTotalOrderBom(thisWeekFrom.toDate(), thisWeekTo.toDate())}
                    suffix="đơn"
                    valueStyle={{color: COLORS.ORDER_STATUS.RETURNED}}
                />
                <Statistic
                    title="Số tiền bom"
                    value={orderUtils.getTotalAmountBom(thisWeekFrom.toDate(), thisWeekTo.toDate())}
                    suffix="đ"
                    valueStyle={{color: COLORS.ORDER_STATUS.RETURNED}}
                />
            </Stack>
        </Card>
        <br/>
        <Card bordered={false} title={"Tuần trước"}>
            <Stack fullwidth justify={"space-between"}>
                <Statistic
                    title="Số đơn bán"
                    value={orderUtils.getTotalOrderSold(lastWeekFrom.toDate(), lastWeekTo.toDate())}
                    suffix="đơn"
                    valueStyle={{color: COLORS.ORDER_STATUS.SHIPPED}}
                />
                <Statistic
                    title="Số tiền bán"
                    value={orderUtils.getTotalAmountSold(lastWeekFrom.toDate(), lastWeekTo.toDate())}
                    suffix="đ"
                    valueStyle={{color: COLORS.ORDER_STATUS.SHIPPED}}
                />
            </Stack>
            <Stack fullwidth justify={"space-between"}>
                <Statistic
                    title="Số đơn bom"
                    value={orderUtils.getTotalOrderBom(lastWeekFrom.toDate(), lastWeekTo.toDate())}
                    suffix="đơn"
                    valueStyle={{color: COLORS.ORDER_STATUS.RETURNED}}
                />
                <Statistic
                    title="Số tiền bom"
                    value={orderUtils.getTotalAmountBom(lastWeekFrom.toDate(), lastWeekTo.toDate())}
                    suffix="đ"
                    valueStyle={{color: COLORS.ORDER_STATUS.RETURNED}}
                />
            </Stack>
        </Card>
        <Divider>Thống kê theo Tháng</Divider>
        <Card bordered={false} title={"Tháng này"}>
            <Stack fullwidth justify={"space-between"}>
                <Statistic
                    title="Số đơn bán"
                    value={orderUtils.getTotalOrderSold(thisMonthFrom.toDate(), thisMonthTo.toDate())}
                    suffix="đơn"
                    valueStyle={{color: COLORS.ORDER_STATUS.SHIPPED}}
                />
                <Statistic
                    title="Số tiền bán"
                    value={orderUtils.getTotalAmountSold(thisMonthFrom.toDate(), thisMonthTo.toDate())}
                    suffix="đ"
                    valueStyle={{color: COLORS.ORDER_STATUS.SHIPPED}}
                />
            </Stack>
            <Stack fullwidth justify={"space-between"}>
                <Statistic
                    title="Số đơn bom"
                    value={orderUtils.getTotalOrderBom(thisMonthFrom.toDate(), thisMonthTo.toDate())}
                    suffix="đơn"
                    valueStyle={{color: COLORS.ORDER_STATUS.RETURNED}}
                />
                <Statistic
                    title="Số tiền bom"
                    value={orderUtils.getTotalAmountBom(thisMonthFrom.toDate(), thisMonthTo.toDate())}
                    suffix="đ"
                    valueStyle={{color: COLORS.ORDER_STATUS.RETURNED}}
                />
            </Stack>
        </Card>
        <br/>
        <Card bordered={false} title={"Tháng trước"}>
            <Stack fullwidth justify={"space-between"}>
                <Statistic
                    title="Số đơn bán"
                    value={orderUtils.getTotalOrderSold(lastMonthFrom.toDate(), lastMonthTo.toDate())}
                    suffix="đơn"
                    valueStyle={{color: COLORS.ORDER_STATUS.SHIPPED}}
                />
                <Statistic
                    title="Số tiền bán"
                    value={orderUtils.getTotalAmountSold(lastMonthFrom.toDate(), lastMonthTo.toDate())}
                    suffix="đ"
                    valueStyle={{color: COLORS.ORDER_STATUS.SHIPPED}}
                />
            </Stack>
            <Stack fullwidth justify={"space-between"}>
                <Statistic
                    title="Số đơn bom"
                    value={orderUtils.getTotalOrderBom(lastMonthFrom.toDate(), lastMonthTo.toDate())}
                    suffix="đơn"
                    valueStyle={{color: COLORS.ORDER_STATUS.RETURNED}}
                />
                <Statistic
                    title="Số tiền bom"
                    value={orderUtils.getTotalAmountBom(lastMonthFrom.toDate(), lastMonthTo.toDate())}
                    suffix="đ"
                    valueStyle={{color: COLORS.ORDER_STATUS.RETURNED}}
                />
            </Stack>
        </Card>
        <br/>
    </React.Fragment>
}
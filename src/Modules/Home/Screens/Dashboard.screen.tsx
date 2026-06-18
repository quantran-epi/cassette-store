import React from "react";
import { useScreenTitle } from "@hooks";
import moment from "moment";
import { Card } from "@components/Card";
import { Statistic, Tabs, TabsProps } from "antd";
import { Stack } from "@components/Layout/Stack";
import {
    COLORS,
} from "@common/Constants/AppConstants";
import { useSelector } from "react-redux";
import { RootState } from "@store/Store";
import { Col, Row } from "@components/Grid";
import { List } from "@components/List";
import { Space } from "@components/Layout/Space";
import { Typography } from "@components/Typography";
import { Tag } from "@components/Tag";
import {selectDashboardReadModel} from "@store/Selectors/DashboardSelectors";

moment.updateLocale('en', { week: { dow: 1 } });

export const DashboardScreen = () => {
    const orders = useSelector((state: RootState) => state.order.orders);
    const dashboard = useSelector(selectDashboardReadModel);
    useScreenTitle({ value: "Thống kê", deps: [] });

    const items: TabsProps['items'] = [
        {
            key: '1',
            label: 'Tổng',
            children: <React.Fragment>
                <Card title="Tổng tiền">
                    <Stack fullwidth direction={"column"} align={"flex-start"}>
                        <Statistic
                            title="Tổng tiền chuyển khoản"
                            value={dashboard.totals.bankTransferAmount}
                            suffix="đ"
                            valueStyle={{ color: COLORS.ORDER_STATUS.SHIPPED }}
                        />
                        <Statistic
                            title="Tổng tiền COD"
                            value={dashboard.totals.totalCodAmount}
                            suffix="đ"
                            valueStyle={{ color: COLORS.ORDER_STATUS.SHIPPED }}
                        />
                        <Statistic
                            title="Tổng phí ship"
                            value={dashboard.totals.totalShippingCost}
                            suffix="đ"
                            valueStyle={{ color: COLORS.ORDER_STATUS.RETURNED }}
                        />
                    </Stack>
                </Card>
            </React.Fragment>,
        },
        {
            key: '2',
            label: 'COD',
            children: <Card>
                <Stack fullwidth direction={"column"} align={"flex-start"}>
                    <Statistic
                        title="Số đơn COD"
                        value={dashboard.totals.codOrderCount.toLocaleString().concat("/").concat(orders.length.toLocaleString())}
                        valueStyle={{ color: COLORS.ORDER_STATUS.SHIPPED }}
                    />
                    <Statistic
                        title="Tổng tiền COD trên đơn"
                        value={dashboard.totals.totalCodAmount}
                        suffix="đ"
                        valueStyle={{ color: COLORS.ORDER_STATUS.SHIPPED }}
                    />
                    <Statistic
                        title="Tổng tiền COD nhận về (trừ ship)"
                        value={dashboard.totals.totalCodNetAmount}
                        suffix="đ"
                        valueStyle={{ color: COLORS.ORDER_STATUS.SHIPPED }}
                    />
                    <Statistic
                        title="COD đã trả"
                        value={dashboard.totals.codPaidAmount}
                        suffix="đ"
                        valueStyle={{ color: COLORS.ORDER_STATUS.SHIPPED }}
                    />
                    <Statistic
                        title="COD chưa trả (đã giao thành công)"
                        value={dashboard.totals.codUnpaidShippedAmount}
                        suffix="đ"
                        valueStyle={{ color: COLORS.ORDER_STATUS.WAITING_FOR_RETURNED }}
                    />
                    <Statistic
                        title="COD chưa giao thành công"
                        value={dashboard.totals.codNotShippedAmount}
                        suffix="đ"
                    />
                    <Statistic
                        title="Tổng phí ship"
                        value={dashboard.totals.totalShippingCost}
                        suffix="đ"
                        valueStyle={{ color: COLORS.ORDER_STATUS.RETURNED }}
                    />
                </Stack>
            </Card>,
        },
        {
            key: '3',
            label: 'Chuyển khoản',
            children: <Card>
                <Stack fullwidth direction={"column"} align={"flex-start"}>
                    <Statistic
                        title="Tổng tiền đã chuyển khoản"
                        value={dashboard.totals.bankTransferAmount}
                        suffix="đ"
                        valueStyle={{ color: COLORS.ORDER_STATUS.SHIPPED }}
                    />
                    <Statistic
                        title="Số đơn chuyển khoản"
                        value={dashboard.totals.bankTransferOrderCount.toLocaleString().concat("/").concat(orders.length.toLocaleString())}
                        valueStyle={{ color: COLORS.ORDER_STATUS.SHIPPED }}
                    />
                </Stack>
            </Card>
        },
        {
            key: '5',
            label: "Khách hàng",
            children: <React.Fragment>
                <Card bordered={false} title={"Khách mua lại"}>
                    <Row>
                        <Col span={18}>
                            <Statistic
                                title="Mua lại lần 2"
                                value={dashboard.customers.repeatSecondPurchaseCount}
                                suffix=""
                                valueStyle={{ color: COLORS.CUSTOMER.CONFIRMED }}
                            />
                        </Col>
                        <Col span={6}>
                            <Statistic
                                title="VIP"
                                value={dashboard.customers.vipCount}
                                suffix=""
                                valueStyle={{ color: COLORS.CUSTOMER.VIP }}
                            />
                        </Col>
                        <Col span={18}>
                            <Statistic
                                title="Mua lại 3 lần trở lên"
                                value={dashboard.customers.repeatThreePlusPurchaseCount}
                                suffix=""
                                valueStyle={{ color: COLORS.CUSTOMER.CONFIRMED }}
                            />
                        </Col>
                        <Col span={6}>
                            <Statistic
                                title="Bom"
                                value={dashboard.customers.blacklistCount}
                                suffix=""
                                valueStyle={{ color: COLORS.CUSTOMER.BLACK_LIST }}
                            />
                        </Col>
                    </Row>
                </Card>
                <br />
                <Card bordered={false} title={"Top 10 số tiền"}>
                    <List
                        size="small"
                        pagination={false}
                        itemLayout="horizontal"
                        dataSource={dashboard.customers.topByAmount}
                        renderItem={(item, index) => <List.Item style={{ padding: 0, paddingBottom: 5, paddingTop: 5 }}>
                            <Stack fullwidth style={{ marginBottom: 3 }} justify="space-between" gap={5}>
                                <Space size={3}>
                                    <Typography.Paragraph ellipsis style={{
                                        width: 220,
                                        marginBottom: 0,
                                        color: item.color
                                    }}>{index + 1}. {item.customer.name.concat("-").concat(item.customer.province)}</Typography.Paragraph>
                                </Space>
                                <Tag>{item.buyAmount.toLocaleString()} đ</Tag>
                            </Stack>
                        </List.Item>}
                    />
                </Card>
                <br />
                <Card bordered={false} title={"Top 10 số lần mua"}>
                    <List
                        size="small"
                        pagination={false}
                        itemLayout="horizontal"
                        dataSource={dashboard.customers.topByBuyCount}
                        renderItem={(item, index) => <List.Item style={{ padding: 0, paddingBottom: 5, paddingTop: 5 }}>
                            <Stack fullwidth style={{ marginBottom: 3 }} justify="space-between" gap={5}>
                                <Space size={3}>
                                    <Typography.Paragraph ellipsis style={{
                                        width: 280,
                                        marginBottom: 0,
                                        color: item.color
                                    }}>{index + 1}. {item.customer.name.concat("-").concat(item.customer.province)}</Typography.Paragraph>
                                </Space>
                                <Tag>{item.customer.buyCount}</Tag>
                            </Stack>
                        </List.Item>}
                    />
                </Card>
            </React.Fragment>
        },
        {
            key: '6',
            label: 'Bom',
            children: <Card>
                <Stack fullwidth align="flex-start" direction="column">
                    <Statistic
                        title="Số đơn"
                        value={dashboard.totals.refuseToReceiveOrderCount}
                        suffix=""
                        valueStyle={{ color: COLORS.ORDER_STATUS.RETURNED }}
                    />
                    <Statistic
                        title="Số băng"
                        value={dashboard.totals.refuseToReceiveCassetteCount}
                        suffix=""
                        valueStyle={{ color: COLORS.ORDER_STATUS.RETURNED }}
                    />
                    <Statistic
                        title="Tiền ship"
                        value={dashboard.totals.refuseToReceiveShippingCost}
                        suffix="đ"
                        valueStyle={{ color: COLORS.ORDER_STATUS.RETURNED }}
                    />
                </Stack>
            </Card>,
        },
    ];

    return <React.Fragment>
        <Tabs defaultActiveKey="1" items={items} />
    </React.Fragment>
}

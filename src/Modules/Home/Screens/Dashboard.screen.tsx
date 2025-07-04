import { RootRoutes } from "@routing/RootRoutes";
import { Navigate } from "react-router-dom";
import React, { useEffect } from "react";
import { useOrder, useScreenTitle } from "@hooks";
import moment from "moment";
import { Card } from "@components/Card";
import { Statistic, Tabs, TabsProps } from "antd";
import { Stack } from "@components/Layout/Stack";
import {
    COLORS,
    ORDER_ITEM_TYPE,
    ORDER_PAYMENT_METHOD,
    ORDER_RETURN_REASON,
    ORDER_STATUS
} from "@common/Constants/AppConstants";
import { Divider } from "@components/Layout/Divider";
import { ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { RootState } from "@store/Store";
import { Col, Row } from "@components/Grid";
import { List } from "@components/List";
import { OrderItemWidget } from "@modules/Order/Screens/OrderItem/OrderItem.widget";
import { orderBy, sortBy } from "lodash";
import { Space } from "@components/Layout/Space";
import { Typography } from "@components/Typography";
import { Tag } from "@components/Tag";
import { useMessage } from "@components/Message";

moment.updateLocale('en', { week: { dow: 1 } });

export const DashboardScreen = () => {
    const orders = useSelector((state: RootState) => state.order.orders);
    const customers = useSelector((state: RootState) => state.customer.customers);
    const { } = useScreenTitle({ value: "Thống kê", deps: [] });
    const orderUtils = useOrder();
    const message = useMessage();

    useEffect(() => {
        orderUtils.refreshDoneOrders().then(e => message.success("Đã cập nhật các đơn đóng hàng"))
            .catch(e => message.error("Lỗi cập nhật các đơn đóng hàng"));
    }, [])

    const items: TabsProps['items'] = [
        {
            key: '1',
            label: 'Tổng',
            children: <Card>
                <Stack fullwidth direction={"column"} align={"flex-start"}>
                    <Statistic
                        title="Tổng COD"
                        value={orders.reduce((prev, cur) => prev + cur.codAmount, 0)}
                        suffix="đ"
                        valueStyle={{ color: COLORS.ORDER_STATUS.SHIPPED }}
                    />
                    <Statistic
                        title="Tổng chuyển khoản"
                        value={orders.filter(e => e.paymentMethod === ORDER_PAYMENT_METHOD.BANK_TRANSFER_IN_ADVANCE).reduce((prev, cur) => prev + cur.paymentAmount, 0)}
                        suffix="đ"
                        valueStyle={{ color: COLORS.ORDER_STATUS.SHIPPED }}
                    />
                    <Statistic
                        title="Tổng tiền đơn (số băng x đơn giá)"
                        value={orders.reduce((prev, cur) => prev + cur.placedItems.reduce((prev1, cur1) => prev1 + (cur1.count * cur1.unitPrice), 0), 0)}
                        suffix="đ"
                        valueStyle={{ color: COLORS.ORDER_STATUS.SHIPPED }}
                    />
                    <Statistic
                        title="Tổng ship"
                        value={orders.reduce((prev, cur) => prev + cur.shippingCost, 0)}
                        suffix="đ"
                        valueStyle={{ color: COLORS.ORDER_STATUS.RETURNED }}
                    />
                </Stack>
            </Card>,
        },
        {
            key: '2',
            label: 'COD',
            children: <Card>
                <Stack fullwidth direction={"column"} align={"flex-start"}>
                    <Statistic
                        title="Đã thu COD"
                        value={orders.filter(e => e.isPayCOD === true).reduce((prev, cur) => prev + cur.codAmount, 0)}
                        suffix="đ"
                        valueStyle={{ color: COLORS.ORDER_STATUS.SHIPPED }}
                    />
                    <Statistic
                        title="Chưa thu COD (đã giao thành công)"
                        value={orders.filter(e => e.status === ORDER_STATUS.SHIPPED && e.isPayCOD === false).reduce((prev, cur) => prev + cur.codAmount, 0)}
                        suffix="đ"
                        valueStyle={{ color: COLORS.ORDER_STATUS.WAITING_FOR_RETURNED }}
                    />
                    <Statistic
                        title="Chưa giao thành công"
                        value={orders.filter(e => e.status !== ORDER_STATUS.SHIPPED).reduce((prev, cur) => prev + cur.codAmount, 0)}
                        suffix="đ"
                        valueStyle={{ color: COLORS.ORDER_STATUS.PAY_COD }}
                    />
                </Stack>
            </Card>,
        },
        {
            key: '3',
            label: 'Bom',
            children: <Card>
                <Stack fullwidth align="flex-start" direction="column">
                    <Statistic
                        title="Số đơn"
                        value={orders.filter(e => e.status === ORDER_STATUS.RETURNED && e.returnReason === ORDER_RETURN_REASON.REFUSE_TO_RECEIVE).length}
                        suffix=""
                        valueStyle={{ color: COLORS.ORDER_STATUS.RETURNED }}
                    />
                    <Statistic
                        title="Số băng"
                        value={orders.filter(e => e.status === ORDER_STATUS.RETURNED && e.returnReason === ORDER_RETURN_REASON.REFUSE_TO_RECEIVE)
                            .reduce((prev, cur) => prev + cur.placedItems.reduce((prev1, cur1) => prev1 + cur1.count, 0), 0)}
                        suffix=""
                        valueStyle={{ color: COLORS.ORDER_STATUS.RETURNED }}
                    />
                </Stack>
                <Statistic
                    title="Tiền ship"
                    value={orders.filter(e => e.status === ORDER_STATUS.RETURNED && e.returnReason === ORDER_RETURN_REASON.REFUSE_TO_RECEIVE)
                        .reduce((prev, cur) => prev + cur.shippingCost, 0)}
                    suffix="đ"
                    valueStyle={{ color: COLORS.ORDER_STATUS.RETURNED }}
                />
            </Card>,
        },
        {
            key: '4',
            label: 'Loại băng',
            children: <Card>
                <Stack fullwidth direction={"column"} align={"flex-start"}>
                    <Statistic
                        title="Tổng số băng"
                        value={orders.reduce((prev, cur) => prev + cur.placedItems.reduce((prev1, cur1) => prev1 + cur1.count, 0), 0)}
                        suffix=""
                        valueStyle={{ color: COLORS.ORDER_STATUS.PAY_COD }}
                    />
                    {Object.keys(ORDER_ITEM_TYPE).map(key => <Statistic
                        title={key}
                        value={orders
                            .reduce((prev, cur) => prev + cur.placedItems.filter(c => c.type === key).reduce((prev1, cur1) => prev1 + cur1.count, 0), 0)}
                        suffix=""
                        valueStyle={{ color: COLORS.ORDER_STATUS.SHIPPED }}
                    />)}
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
                                value={customers.filter(c => c.buyCount == 2).length}
                                suffix=""
                                valueStyle={{ color: COLORS.CUSTOMER.CONFIRMED }}
                            />
                        </Col>
                        <Col span={6}>
                            <Statistic
                                title="VIP"
                                value={customers.filter(c => c.isVIP).length}
                                suffix=""
                                valueStyle={{ color: COLORS.CUSTOMER.VIP }}
                            />
                        </Col>
                        <Col span={18}>
                            <Statistic
                                title="Mua lại 3 lần trở lên"
                                value={customers.filter(c => c.buyCount > 2).length}
                                suffix=""
                                valueStyle={{ color: COLORS.CUSTOMER.CONFIRMED }}
                            />
                        </Col>
                        <Col span={6}>
                            <Statistic
                                title="Bom"
                                value={customers.filter(c => c.isInBlacklist).length}
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
                        dataSource={orderBy(customers, ['buyAmount'], ['desc']).slice(0, 10)}
                        renderItem={(item, index) => <List.Item style={{ padding: 0, paddingBottom: 5, paddingTop: 5 }}>
                            <Stack fullwidth style={{ marginBottom: 3 }} justify="space-between" gap={5}>
                                <Space size={3}>
                                    <Typography.Text>{index + 1}. {item.name}</Typography.Text>
                                    {item.isVIP && <Tag color={COLORS.CUSTOMER.VIP}>VIP</Tag>}
                                </Space>
                                <Tag>{item.buyAmount.toLocaleString()}đ</Tag>
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
                        dataSource={orderBy(customers, ['buyCount'], ['desc']).slice(0, 10)}
                        renderItem={(item, index) => <List.Item style={{ padding: 0, paddingBottom: 5, paddingTop: 5 }}>
                            <Stack fullwidth style={{ marginBottom: 3 }} justify="space-between" gap={5}>
                                <Space size={3}>
                                    <Typography.Text>{index + 1}. {item.name}</Typography.Text>
                                    {item.isVIP && <Tag color={COLORS.CUSTOMER.VIP}>VIP</Tag>}
                                </Space>
                                <Tag>{item.buyCount}</Tag>
                            </Stack>
                        </List.Item>}
                    />
                </Card>
            </React.Fragment>
        }
    ];

    return <React.Fragment>
        <Tabs defaultActiveKey="1" items={items} />
    </React.Fragment>
}
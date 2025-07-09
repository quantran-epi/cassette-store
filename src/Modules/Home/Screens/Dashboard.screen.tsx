import {RootRoutes} from "@routing/RootRoutes";
import {Navigate} from "react-router-dom";
import React, {useEffect} from "react";
import {useOrder, useScreenTitle} from "@hooks";
import moment from "moment";
import {Card} from "@components/Card";
import {Statistic, Tabs, TabsProps} from "antd";
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
import {List} from "@components/List";
import {OrderItemWidget} from "@modules/Order/Screens/OrderItem/OrderItem.widget";
import {orderBy, sortBy} from "lodash";
import {Space} from "@components/Layout/Space";
import {Typography} from "@components/Typography";
import {Tag} from "@components/Tag";
import {useMessage} from "@components/Message";

moment.updateLocale('en', {week: {dow: 1}});

export const DashboardScreen = () => {
    const orders = useSelector((state: RootState) => state.order.orders);
    const customers = useSelector((state: RootState) => state.customer.customers);
    const {} = useScreenTitle({value: "Thống kê", deps: []});

    const shippingFeeInterest = () => orders.filter(e => (e.status === ORDER_STATUS.SHIPPED && e.isPayCOD == true) || e.paymentMethod === ORDER_PAYMENT_METHOD.BANK_TRANSFER_IN_ADVANCE)
            .reduce((prev, cur) => prev + (cur.paymentAmount - cur.placedItems.reduce((prev1, cur1) => prev1 + (cur1.count * cur1.unitPrice), 0)), 0)
        - orders.reduce((prev, cur) => prev + cur.shippingCost, 0);

    const actualInterest = () => orders.filter(e => (e.status === ORDER_STATUS.SHIPPED && e.isPayCOD == true) || e.paymentMethod === ORDER_PAYMENT_METHOD.BANK_TRANSFER_IN_ADVANCE)
            .reduce((prev, cur) => prev + cur.placedItems.reduce((prev1, cur1) => prev1 + (cur1.count * (cur1.unitPrice * 0.6)), 0), 0)
        + shippingFeeInterest();

    const items: TabsProps['items'] = [
        {
            key: '1',
            label: 'Tổng',
            children: <React.Fragment>
                <Card title="Tổng tiền">
                    <Stack fullwidth direction={"column"} align={"flex-start"}>
                        <Statistic
                            title="Tổng tiền theo số băng"
                            value={orders.reduce((prev, cur) => prev + cur.placedItems.reduce((prev1, cur1) => prev1 + (cur1.count * cur1.unitPrice), 0), 0)}
                            suffix="đ"
                            valueStyle={{color: COLORS.ORDER_STATUS.SHIPPED}}
                        />
                        <Statistic
                            title="Tổng tiền chuyển khoản"
                            value={orders.filter(e => e.paymentMethod === ORDER_PAYMENT_METHOD.BANK_TRANSFER_IN_ADVANCE).reduce((prev, cur) => prev + cur.paymentAmount, 0)}
                            suffix="đ"
                            valueStyle={{color: COLORS.ORDER_STATUS.SHIPPED}}
                        />
                        <Statistic
                            title="Tổng tiền COD"
                            value={orders.reduce((prev, cur) => prev + cur.codAmount, 0)}
                            suffix="đ"
                            valueStyle={{color: COLORS.ORDER_STATUS.SHIPPED}}
                        />
                        <Statistic
                            title="Tổng phí ship"
                            value={orders.reduce((prev, cur) => prev + cur.shippingCost, 0)}
                            suffix="đ"
                            valueStyle={{color: COLORS.ORDER_STATUS.RETURNED}}
                        />
                    </Stack>
                </Card>
                <br/>
                <Card title="Lãi">
                    <Stack fullwidth direction={"column"} align={"flex-start"}>
                        <Statistic
                            title="Thu về thực tế (tổng đã thu về - tổng ship)"
                            value={orders.filter(e => (e.status === ORDER_STATUS.SHIPPED && e.isPayCOD == true) || e.paymentMethod === ORDER_PAYMENT_METHOD.BANK_TRANSFER_IN_ADVANCE)
                                .reduce((prev, cur) => prev + cur.paymentAmount, 0)
                        - orders.reduce((prev, cur) => prev + cur.shippingCost, 0)}
                            suffix="đ"
                            valueStyle={{color: COLORS.ORDER_STATUS.SHIPPED}}
                        />
                        <Statistic
                            title="Lãi phí ship (tổng ship thu - tổng ship trả )"
                            value={shippingFeeInterest()}
                            suffix="đ"
                            valueStyle={{color: shippingFeeInterest() > 0 ? COLORS.ORDER_STATUS.SHIPPED : COLORS.ORDER_STATUS.RETURNED}}
                        />
                        <Statistic
                            title="Lãi thực tế (60%/băng, lãi theo băng + lãi ship)"
                            value={actualInterest()}
                            suffix="đ"
                            valueStyle={{color: actualInterest() > 0 ? COLORS.ORDER_STATUS.SHIPPED : COLORS.ORDER_STATUS.RETURNED}}
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
                        value={orders.filter(e => e.codAmount !== 0).length.toLocaleString().concat("/").concat(orders.length.toLocaleString())}
                        valueStyle={{color: COLORS.ORDER_STATUS.SHIPPED}}
                    />
                    <Statistic
                        title="Tổng tiền COD trên đơn"
                        value={orders.reduce((prev, cur) => prev + cur.codAmount, 0)}
                        suffix="đ"
                        valueStyle={{color: COLORS.ORDER_STATUS.SHIPPED}}
                    />
                    <Statistic
                        title="Tổng tiền COD nhận về (trừ ship)"
                        value={orders.reduce((prev, cur) => prev + (cur.codAmount - cur.shippingCost), 0)}
                        suffix="đ"
                        valueStyle={{color: COLORS.ORDER_STATUS.SHIPPED}}
                    />
                    <Statistic
                        title="COD đã trả"
                        value={orders.filter(e => e.isPayCOD === true).reduce((prev, cur) => prev + (cur.codAmount - cur.shippingCost), 0)}
                        suffix="đ"
                        valueStyle={{color: COLORS.ORDER_STATUS.SHIPPED}}
                    />
                    <Statistic
                        title="COD chưa trả (đã giao thành công)"
                        value={orders.filter(e => e.paymentMethod === ORDER_PAYMENT_METHOD.CASH_COD && e.status === ORDER_STATUS.SHIPPED && e.isPayCOD === false).reduce((prev, cur) => prev + (cur.codAmount - cur.shippingCost), 0)}
                        suffix="đ"
                        valueStyle={{color: COLORS.ORDER_STATUS.WAITING_FOR_RETURNED}}
                    />
                    <Statistic
                        title="COD chưa giao thành công"
                        value={orders.filter(e => e.paymentMethod === ORDER_PAYMENT_METHOD.CASH_COD && e.status !== ORDER_STATUS.SHIPPED).reduce((prev, cur) => prev + (cur.codAmount - cur.shippingCost), 0)}
                        suffix="đ"
                    />
                    <Statistic
                        title="Tổng phí ship"
                        value={orders.reduce((prev, cur) => prev + cur.shippingCost, 0)}
                        suffix="đ"
                        valueStyle={{color: COLORS.ORDER_STATUS.RETURNED}}
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
                        value={orders.filter(e => e.paymentMethod === ORDER_PAYMENT_METHOD.BANK_TRANSFER_IN_ADVANCE).reduce((prev, cur) => prev + cur.paymentAmount, 0)}
                        suffix="đ"
                        valueStyle={{color: COLORS.ORDER_STATUS.SHIPPED}}
                    />
                    <Statistic
                        title="Số đơn chuyển khoản"
                        value={orders.filter(e => e.paymentMethod === ORDER_PAYMENT_METHOD.BANK_TRANSFER_IN_ADVANCE).length.toLocaleString().concat("/").concat(orders.length.toLocaleString())}
                        valueStyle={{color: COLORS.ORDER_STATUS.SHIPPED}}
                    />
                </Stack>
            </Card>
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
                        valueStyle={{color: COLORS.ORDER_STATUS.PAY_COD}}
                    />
                    {Object.keys(ORDER_ITEM_TYPE).map(key => <Statistic
                        title={key}
                        value={orders
                            .reduce((prev, cur) => prev + cur.placedItems.filter(c => c.type === key).reduce((prev1, cur1) => prev1 + cur1.count, 0), 0)}
                        suffix=""
                        valueStyle={{color: COLORS.ORDER_STATUS.SHIPPED}}
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
                                valueStyle={{color: COLORS.CUSTOMER.CONFIRMED}}
                            />
                        </Col>
                        <Col span={6}>
                            <Statistic
                                title="VIP"
                                value={customers.filter(c => c.isVIP).length}
                                suffix=""
                                valueStyle={{color: COLORS.CUSTOMER.VIP}}
                            />
                        </Col>
                        <Col span={18}>
                            <Statistic
                                title="Mua lại 3 lần trở lên"
                                value={customers.filter(c => c.buyCount > 2).length}
                                suffix=""
                                valueStyle={{color: COLORS.CUSTOMER.CONFIRMED}}
                            />
                        </Col>
                        <Col span={6}>
                            <Statistic
                                title="Bom"
                                value={customers.filter(c => c.isInBlacklist).length}
                                suffix=""
                                valueStyle={{color: COLORS.CUSTOMER.BLACK_LIST}}
                            />
                        </Col>
                    </Row>
                </Card>
                <br/>
                <Card bordered={false} title={"Top 10 số tiền"}>
                    <List
                        size="small"
                        pagination={false}
                        itemLayout="horizontal"
                        dataSource={orderBy(customers, ['buyAmount'], ['desc']).slice(0, 10)}
                        renderItem={(item, index) => <List.Item style={{padding: 0, paddingBottom: 5, paddingTop: 5}}>
                            <Stack fullwidth style={{marginBottom: 3}} justify="space-between" gap={5}>
                                <Space size={3}>
                                    <Typography.Paragraph ellipsis style={{
                                        width: 220,
                                        marginBottom: 0
                                    }}>{index + 1}. {item.name.concat("-").concat(item.province)}</Typography.Paragraph>
                                    {item.isVIP && <Tag color={COLORS.CUSTOMER.VIP}>VIP</Tag>}
                                </Space>
                                <Tag>{item.buyAmount.toLocaleString()} đ</Tag>
                            </Stack>
                        </List.Item>}
                    />
                </Card>
                <br/>
                <Card bordered={false} title={"Top 10 số lần mua"}>
                    <List
                        size="small"
                        pagination={false}
                        itemLayout="horizontal"
                        dataSource={orderBy(customers, ['buyCount'], ['desc']).slice(0, 10)}
                        renderItem={(item, index) => <List.Item style={{padding: 0, paddingBottom: 5, paddingTop: 5}}>
                            <Stack fullwidth style={{marginBottom: 3}} justify="space-between" gap={5}>
                                <Space size={3}>
                                    <Typography.Paragraph ellipsis style={{
                                        width: 280,
                                        marginBottom: 0
                                    }}>{index + 1}. {item.name.concat("-").concat(item.province)}</Typography.Paragraph>
                                    {item.isVIP && <Tag color={COLORS.CUSTOMER.VIP}>VIP</Tag>}
                                </Space>
                                <Tag>{item.buyCount}</Tag>
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
                        value={orders.filter(e => (e.status === ORDER_STATUS.RETURNED || e.status === ORDER_STATUS.WAITING_FOR_RETURNED) && e.returnReason === ORDER_RETURN_REASON.REFUSE_TO_RECEIVE).length}
                        suffix=""
                        valueStyle={{color: COLORS.ORDER_STATUS.RETURNED}}
                    />
                    <Statistic
                        title="Số băng"
                        value={orders.filter(e => (e.status === ORDER_STATUS.RETURNED || e.status === ORDER_STATUS.WAITING_FOR_RETURNED) && e.returnReason === ORDER_RETURN_REASON.REFUSE_TO_RECEIVE)
                            .reduce((prev, cur) => prev + cur.placedItems.reduce((prev1, cur1) => prev1 + cur1.count, 0), 0)}
                        suffix=""
                        valueStyle={{color: COLORS.ORDER_STATUS.RETURNED}}
                    />
                    <Statistic
                        title="Tiền ship"
                        value={orders.filter(e => (e.status === ORDER_STATUS.RETURNED || e.status === ORDER_STATUS.WAITING_FOR_RETURNED) && e.returnReason === ORDER_RETURN_REASON.REFUSE_TO_RECEIVE)
                            .reduce((prev, cur) => prev + cur.shippingCost, 0)}
                        suffix="đ"
                        valueStyle={{color: COLORS.ORDER_STATUS.RETURNED}}
                    />
                </Stack>
            </Card>,
        },
    ];

    return <React.Fragment>
        <Tabs defaultActiveKey="1" items={items}/>
    </React.Fragment>
}
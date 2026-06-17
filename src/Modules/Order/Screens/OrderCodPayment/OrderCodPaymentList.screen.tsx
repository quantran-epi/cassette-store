import React, { useMemo, useState } from "react";
import { useScreenTitle, useToggle } from "@hooks";
import { List } from "@components/List";
import { useSelector } from "react-redux";
import { RootState } from "@store/Store";
import { debounce, orderBy } from "lodash";
import { Stack } from "@components/Layout/Stack";
import { Input } from "@components/Form/Input";
import { Button } from "@components/Button";
import { CalendarOutlined, DollarOutlined, PlusOutlined, TruckOutlined } from "@ant-design/icons";
import { CodPaymentCycle } from "@store/Models/CodPaymentCycle";
import { Typography } from "@components/Typography";
import moment from "moment/moment";
import { Space } from "@components/Layout/Space";
import { OrderCodPaymentCreateWidget } from "@modules/Order/Screens/OrderCodPayment/OrderCodPaymentCreate.widget";
import { OrderCodPaymentImportWidget } from "@modules/Order/Screens/OrderCodPayment/OrderCodPaymentImport.widget";

export const OrderCodPaymentListScreen = () => {
    const orders = useSelector((state: RootState) => state.order.orders);
    const payments = useSelector((state: RootState) => state.order.codPayments);
    const [searchText, setSearchText] = useState("");
    const { } = useScreenTitle({ value: "Trả COD", deps: [] });
    const toggleAddPayment = useToggle();

    const filteredPayments = useMemo<CodPaymentCycle[]>(() => {
        return orderBy((payments || []).filter(e => e.name.trim().toLowerCase().includes(searchText.trim().toLowerCase())
        ), ["cycleDate"], ["desc"]);
    }, [payments, searchText])

    const _onAddPayment = () => {
        toggleAddPayment.show();
    }

    return <React.Fragment>
        <Stack.Compact>
            <Input allowClear placeholder="Tìm kiếm" onChange={debounce((e) => setSearchText(e.target.value), 350)} />
            <Button onClick={_onAddPayment} icon={<PlusOutlined />}>Manual cycle</Button>
        </Stack.Compact>
        <OrderCodPaymentImportWidget orders={orders || []} />
        <List
            pagination={filteredPayments.length > 0 ? {
                position: "bottom", align: "center", pageSize: 10
            } : false}
            itemLayout="horizontal"
            locale={{ emptyText: "Chưa có kỳ trả COD nào" }}
            dataSource={filteredPayments}
            renderItem={item => <List.Item>
                <List.Item.Meta
                    title={item.name}
                    description={<Stack gap={4} direction={"column"} align={"flex-start"}>
                        <Space>
                            <DollarOutlined />
                            <Typography.Text>Trả COD: {(orders.filter(e => item.paymentOrders.includes(e.id)).reduce((prev, cur) => prev + cur.codAmount, 0) - orders.filter(e => item.debitFeeOrders.includes(e.id)).reduce((prev, cur) => prev + cur.shippingCost, 0)).toLocaleString()} đ</Typography.Text>
                        </Space>
                        <Space>
                            <TruckOutlined />
                            <Typography.Text>Phí ship: {orders.filter(e => item.debitFeeOrders.includes(e.id)).reduce((prev, cur) => prev + cur.shippingCost, 0).toLocaleString()} đ</Typography.Text>
                        </Space>
                        <Space>
                            <CalendarOutlined />
                            <Typography.Text>{moment(new Date(item.cycleDate)).format("DD-MM-yyyy")}</Typography.Text>
                        </Space>
                    </Stack>}
                />
            </List.Item>} />

        <OrderCodPaymentCreateWidget open={toggleAddPayment.value} onClose={toggleAddPayment.hide} />
    </React.Fragment>
}

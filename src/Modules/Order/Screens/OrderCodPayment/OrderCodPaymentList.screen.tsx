import React, {useEffect, useMemo, useState} from "react";
import {useMessage} from "@components/Message";
import {useNavigate} from "react-router-dom";
import {useScreenTitle, useToggle} from "@hooks";
import {List} from "@components/List";
import {useSelector} from "react-redux";
import {RootState} from "@store/Store";
import {debounce, orderBy, sortBy} from "lodash";
import {Stack} from "@components/Layout/Stack";
import {Input} from "@components/Form/Input";
import {Button} from "@components/Button";
import {CalendarOutlined, DollarOutlined, PlusOutlined} from "@ant-design/icons";
import {Order} from "@store/Models/Order";
import {ORDER_PAYMENT_METHOD} from "@common/Constants/AppConstants";
import {CodPaymentCycle} from "@store/Models/CodPaymentCycle";
import {Typography} from "@components/Typography";
import moment from "moment/moment";
import {Space} from "@components/Layout/Space";
import {OrderCodPaymentCreateWidget} from "@modules/Order/Screens/OrderCodPayment/OrderCodPaymentCreate.widget";

export const OrderCodPaymentListScreen = () => {
    const payments = useSelector((state: RootState) => state.order.codPayments);
    const [searchText, setSearchText] = useState("");
    const message = useMessage();
    const navigate = useNavigate();
    const {} = useScreenTitle({value: "Trả COD", deps: []});
    const toggleAddPayment = useToggle();

    const filteredPayments = useMemo<CodPaymentCycle[]>(() => {
        return orderBy(payments.filter(e => e.name.trim().toLowerCase().includes(searchText.trim().toLowerCase())
        ), ["cycleDate"], ["desc"]);
    }, [payments, searchText])

    const _onAddPayment = () => {
        toggleAddPayment.show();
    }

    return <React.Fragment>
        <Stack.Compact>
            <Input allowClear placeholder="Tìm kiếm" onChange={debounce((e) => setSearchText(e.target.value), 350)}/>
            <Button onClick={_onAddPayment} icon={<PlusOutlined/>}/>
        </Stack.Compact>
        <List
            pagination={payments.length > 0 ? {
                position: "bottom", align: "center", pageSize: 10
            } : false}
            itemLayout="horizontal"
            locale={{emptyText: "Chưa có kỳ trả COD nào"}}
            dataSource={filteredPayments}
            renderItem={item => <List.Item>
                <List.Item.Meta
                    title={item.name}
                    description={<Stack gap={4} direction={"column"} align={"flex-start"}>
                        <Space>
                            <CalendarOutlined/>
                            <Typography.Text>{moment(new Date(item.cycleDate)).format("DD-MM-yyyy")}</Typography.Text>
                        </Space>
                    </Stack>}
                />
            </List.Item>}/>

        <OrderCodPaymentCreateWidget open={toggleAddPayment.value} onClose={toggleAddPayment.hide}/>
    </React.Fragment>
}
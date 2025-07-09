import React, {FunctionComponent, useMemo, useState} from "react";
import {Modal} from "@components/Modal";
import {Space} from "@components/Layout/Space";
import {BarcodeOutlined, CreditCardOutlined, DeleteOutlined} from "@ant-design/icons";
import {Stack} from "@components/Layout/Stack";
import {Button} from "@components/Button";
import {SmartForm} from "@components/SmartForm";
import {Input, List, TabsProps, Transfer} from "antd";
import {useOrder, useToggle} from "@hooks";
import {Tabs} from "@components/Tabs";
import {Option, Select} from "@components/Form/Select";
import {CUSTOMER_PROVINCES, ORDER_STATUS} from "@common/Constants/AppConstants";
import {useSelector} from "react-redux";
import {RootState} from "@store/Store";
import {Order} from "@store/Models/Order";
import moment from "moment";
import {useMessage} from "@components/Message";
import {CodPaymentCycle} from "@store/Models/CodPaymentCycle";
import {nanoid} from "nanoid";
import {useModal} from "@components/Modal/ModalProvider";

type OrderCodPaymentCreateWidgetProps = {
    open: boolean;
    onClose: () => void;
}

export const OrderCodPaymentCreateWidget: FunctionComponent<OrderCodPaymentCreateWidgetProps> = (props) => {
    const orders = useSelector((state: RootState) => state.order.orders);
    const codPaymentCycles = useSelector((state: RootState) => state.order.codPayments || []);
    const toggleLoading = useToggle();
    const [payCodOrders, setPayCodOrders] = useState<Order[]>([]);
    const [debitShipOrders, setDebitShipOrders] = useState<Order[]>([]);
    const orderUtils = useOrder();
    const message = useMessage();
    const modal = useModal();

    const shippedAndNotPayCodOrders = useMemo(() => {
        return orders.filter(e => e.status === ORDER_STATUS.SHIPPED
            && !e.isPayCOD
            && !payCodOrders.map(o => o.id).includes(e.id));
    }, [orders, payCodOrders])

    const debitShipNotSelectedOrders = useMemo(() => {
        return orders.filter(e => moment(new Date(e.createdDate)).isAfter(moment("07/07/2025", "dd/mm/yyyy"))
            && !codPaymentCycles.map(c => c.debitFeeOrders).flat().includes(e.id)
            && !debitShipOrders.map(o => o.id).includes(e.id));
    }, [orders, debitShipOrders])

    const _onSave = () => {
        modal.confirm({
            title: "Lưu đợt trả COD này?",
            onOk: () => {
                let payment: CodPaymentCycle = {
                    id: moment().format("ddmmyyyy").concat(nanoid(5)),
                    name: "Kỳ trả COD" + moment().format("dd/mm/yyyy"),
                    cycleDate: new Date().toUTCString(),
                    debitFeeOrders: debitShipOrders.map(e => e.id),
                    paymentOrders: payCodOrders.map(e => e.id)
                };
                orderUtils.addPaymentOrderCycle(payment);
                message.success("Tạo kỳ trả COD thành công");
                props.onClose();
            }
        })
    }

    const _onSelectPayCodOrders = (value: string[]) => {
        setPayCodOrders(value.map(id => orders.find(e => e.id === id)));
    }

    const _onSelectDebitShipOrders = (value: string[]) => {
        setDebitShipOrders(value.map(id => orders.find(e => e.id === id)));
    }

    const _onRemovePayCodOrder = (item: Order) => {
        setPayCodOrders(payCodOrders.filter(e => e.id !== item.id));
    }

    const _onRemoveDebitShipOrder = (item: Order) => {
        setDebitShipOrders(debitShipOrders.filter(e => e.id !== item.id));
    }

    const items: TabsProps['items'] = [
        {
            key: '1',
            label: 'Trả COD',
            children: <React.Fragment>
                <Select
                    showSearch
                    mode={"multiple"}
                    placeholder="Chọn"
                    onChange={_onSelectPayCodOrders}
                    filterOption={(inputValue, option) => {
                        if (!option?.children) return false;
                        return option?.children?.toString().toLowerCase().includes(inputValue.toLowerCase());
                    }}
                    style={{width: '100%'}}>
                    {shippedAndNotPayCodOrders.map(p => <Option key={p.id}
                                                                value={p.id}>{p.name} ({p.shippingCode})</Option>)}
                </Select>

                <List
                    dataSource={payCodOrders}
                    renderItem={(item) => <List.Item
                        actions={[
                            <Button danger icon={<DeleteOutlined/>} onClick={() => _onRemovePayCodOrder(item)}/>
                        ]}>
                        <List.Item.Meta
                            title={item.name}
                            description={item.shippingCode}
                        />
                    </List.Item>}
                />
            </React.Fragment>,
        },
        {
            key: '2',
            label: 'Thu phí ship',
            children: <React.Fragment>
                <Select
                    showSearch
                    mode={"multiple"}
                    placeholder="Chọn"
                    onChange={_onSelectDebitShipOrders}
                    filterOption={(inputValue, option) => {
                        if (!option?.children) return false;
                        return option?.children?.toString().toLowerCase().includes(inputValue.toLowerCase());
                    }}
                    style={{width: '100%'}}>
                    {debitShipNotSelectedOrders.map(p => <Option key={p.id}
                                                                 value={p.id}>{p.name} ({p.shippingCode})</Option>)}
                </Select>

                <List
                    dataSource={debitShipOrders}
                    renderItem={(item) => <List.Item
                        actions={[
                            <Button danger icon={<DeleteOutlined/>} onClick={() => _onRemoveDebitShipOrder(item)}/>
                        ]}>
                        <List.Item.Meta
                            title={item.name}
                            description={item.shippingCode}
                        />
                    </List.Item>}
                />
            </React.Fragment>,
        }
    ];

    return <Modal open={props.open} title={
        <Space>
            <CreditCardOutlined/>
            Tạo kỳ thanh toán COD {moment().format("dd/mm/yyyy")}
        </Space>
    } destroyOnClose={true} onCancel={props.onClose} footer={<Stack fullwidth justify="flex-end">
        <Button loading={toggleLoading.value} type="primary" onClick={_onSave}>Lưu</Button>
    </Stack>}>
        <Tabs defaultActiveKey="1" items={items}/>
    </Modal>
}
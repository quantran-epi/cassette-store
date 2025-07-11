import React, {ChangeEvent, FunctionComponent, useEffect, useState} from "react";
import {OrderPlacedItem} from "@modules/Order/Screens/OrderCreate/OrderPlacedItem.widget";
import {List} from "@components/List";
import {Order} from "@store/Models/Order";
import {OrderItem} from "@store/Models/OrderItem";
import {OrderHelper} from "@common/Helpers/OrderHelper";
import {Space} from "@components/Layout/Space";
import {BarcodeOutlined, DropboxOutlined, PlusOutlined} from "@ant-design/icons";
import {Stack} from "@components/Layout/Stack";
import {Button} from "@components/Button";
import {Input, message} from "antd";
import {Modal} from "@components/Modal";
import {Typography} from "@components/Typography";
import {Divider} from "@components/Layout/Divider";
import {useOrder, useToggle} from "@hooks";
import {SmartForm} from "@components/SmartForm";
import {TextArea} from "@components/Form/Input";
import {InputNumber} from "@components/Form/InputNumber";

type OrderPlacedItemsWidgetProps = {
    order: Order;
    open: boolean;
    onClose: () => void;
}

export const OrderPlacedItemsWidget: FunctionComponent<OrderPlacedItemsWidgetProps> = props => {
    const [order, setOrder] = useState<Order>(props.order);
    const orderUtils = useOrder();
    const toggleLoading = useToggle();

    useEffect(() => {
        setOrder(props.order);
    }, [props.order]);

    const _onUpdatePlacedItems = (placedItems: OrderItem[]) => {
        let newPaymentAmount = orderUtils.calculateOrderPaymentAmount(placedItems, order.customerId, order.isFreeShip)
        setOrder({
            ...order,
            placedItems: placedItems,
            paymentAmount: newPaymentAmount,
            codAmount: orderUtils.getAutoCODAmount(order.paymentMethod, newPaymentAmount)
        })
    }

    const _onAddPlaceItems = () => {
        let newOrder = OrderHelper.createNewEmptyOrderItem(order.name, order.placedItems.length == 0 ? true : false);
        _onUpdatePlacedItems([...order.placedItems, newOrder]);
    }

    const _onChangePlacedItem = (placedItem: OrderItem) => {
        let updatedOrderItems = order.placedItems.map(e => {
            if (e.id == placedItem.id) return placedItem;
            return e;
        });
        _onUpdatePlacedItems(updatedOrderItems);
    }

    const _onDeletePlacedItem = (id: string) => {
        let updatedPlacedItems = order.placedItems.filter(e => e.id !== id);
        _onUpdatePlacedItems(updatedPlacedItems);
    }

    const _onChangeNote = (e: ChangeEvent<HTMLTextAreaElement>) => {
        setOrder({
            ...order,
            note: e.target.value
        });
    }

    const _onChangePaymentAmount = (value: number) => {
        setOrder({
            ...order,
            paymentAmount: value
        });
    }

    const _onSave = async () => {
        toggleLoading.show();
        let card = await orderUtils.updateOrder(order);
        toggleLoading.hide();
        if (card) {
            message.success("Lưu danh sách băng thành công");
            props.onClose();
        } else message.error("Lỗi lưu danh sách băng")
    }

    return <Modal title={props.order.name} open={props.open} destroyOnClose={true} onCancel={props.onClose}
                  footer={<Stack fullwidth justify="flex-end">
                      <Button loading={toggleLoading.value} type="primary" onClick={_onSave}>Lưu</Button>
                  </Stack>}>
        <Divider orientation="left"><Space>
            <Typography.Text>Danh sách hàng hoá</Typography.Text>
            <Button icon={<PlusOutlined/>} size="small" onClick={_onAddPlaceItems}/>
        </Space></Divider>
        <SmartForm itemDefinitions={{}} layout={"vertical"}>
            <List
                pagination={false}
                itemLayout="horizontal"
                dataSource={order.placedItems}
                locale={{emptyText: "Chưa có danh sách hàng hoá"}}
                renderItem={(item) => <OrderPlacedItem item={item} onDelete={_onDeletePlacedItem}
                                                       onChange={_onChangePlacedItem}
                                                       allPlacedItems={order.placedItems}/>}
            />
            <SmartForm.Item label={"Số tiền thu"}>
                <InputNumber style={{width: "100%"}} placeholder="Nhập số tiền thu"
                             value={order.paymentAmount}
                             onChange={_onChangePaymentAmount}
                             formatter={(value) => `đ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}/>
            </SmartForm.Item>
            <SmartForm.Item label={"Ghi chú thông tin hàng"}>
                <TextArea rows={3} onChange={_onChangeNote} value={order.note}/>
            </SmartForm.Item>
        </SmartForm>
    </Modal>
}
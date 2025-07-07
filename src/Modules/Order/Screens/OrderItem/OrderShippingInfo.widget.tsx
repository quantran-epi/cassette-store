import React, {FunctionComponent, useEffect, useState} from "react";
import {Order} from "@store/Models/Order";
import {useOrder, useToggle} from "@hooks";
import {Modal} from "@components/Modal";
import {Stack} from "@components/Layout/Stack";
import {Button} from "@components/Button";
import {Divider} from "@components/Layout/Divider";
import {Space} from "@components/Layout/Space";
import {Typography} from "@components/Typography";
import {PlusOutlined} from "@ant-design/icons";
import {SmartForm} from "@components/SmartForm";
import {List} from "@components/List";
import {OrderPlacedItem} from "@modules/Order/Screens/OrderCreate/OrderPlacedItem.widget";
import {InputNumber} from "@components/Form/InputNumber";
import {TextArea} from "@components/Form/Input";
import {message, RadioChangeEvent} from "antd";
import {Checkbox} from "@components/Form/Checkbox";
import {CheckboxChangeEvent} from "antd/es/checkbox";
import {Radio} from "@components/Form/Radio";
import {ORDER_PAYMENT_METHOD, ORDER_SHIPPING_PARTNER} from "@common/Constants/AppConstants";

type OrderShippingInfoWidgetProps = {
    order: Order;
    open: boolean;
    onClose: () => void;
}

export const OrderShippinInfoWidget: FunctionComponent<OrderShippingInfoWidgetProps> = props => {
    const [order, setOrder] = useState<Order>(props.order);
    const orderUtils = useOrder();
    const toggleLoading = useToggle();

    useEffect(() => {
        setOrder(props.order);
    }, [props.order]);

    const _onChangeCODAmount = (value: number) => {
        setOrder({
            ...order,
            codAmount: value
        });
    }

    const _onChangeShippingCode = (value: number) => {
        setOrder({
            ...order,
            shippingCost: value
        });
    }

    const _onChangeIsFreeShip = (e: CheckboxChangeEvent) => {
        let newPaymentAmount = orderUtils.calculateOrderPaymentAmount(order.placedItems,
            order.customerId, e.target.checked);
        setOrder({
            ...order,
            isFreeShip: e.target.checked,
            paymentAmount: newPaymentAmount,
            codAmount: orderUtils.getAutoCODAmount(order.paymentMethod, newPaymentAmount)
        })
    }

    const _onChangePaymentMethod = (e: RadioChangeEvent) => {
        setOrder({
            ...order,
            paymentMethod: e.target.value,
            codAmount: orderUtils.getAutoCODAmount(e.target.value, order.paymentAmount)
        })
    }

    const _onChangeShippingPartner = (e: RadioChangeEvent) => {
        setOrder({
            ...order,
            shippingPartner: e.target.value,
        })
    }

    const _onSave = async () => {
        toggleLoading.show();
        let card = await orderUtils.updateOrder(order);
        toggleLoading.hide();
        if (card) {
            message.success("Lưu thông tin vận chuyển thành công");
            props.onClose();
        } else message.error("Lỗi lưu thông tin vận chuyển")
    }

    return <Modal title={props.order.name} open={props.open} destroyOnClose={true} onCancel={props.onClose}
                  footer={<Stack fullwidth justify="flex-end">
                      <Button loading={toggleLoading.value} type="primary" onClick={_onSave}>Lưu</Button>
                  </Stack>}>
        <SmartForm itemDefinitions={{}} layout={"vertical"}>
            <SmartForm.Item>
                <Checkbox checked={order.isFreeShip} onChange={_onChangeIsFreeShip}>Miễn phí vận chuyển</Checkbox>
            </SmartForm.Item>
            <SmartForm.Item label={"Đơn vị vận chuyển"}>
                <Radio.Group
                    value={order.shippingPartner}
                    onChange={_onChangeShippingPartner}
                    options={[
                        {value: ORDER_SHIPPING_PARTNER.VNPOST, label: ORDER_SHIPPING_PARTNER.VNPOST},
                        {value: ORDER_SHIPPING_PARTNER.VIETTEL_POST, label: ORDER_SHIPPING_PARTNER.VIETTEL_POST}
                    ]}
                />
            </SmartForm.Item>
            <SmartForm.Item label={"Phương thức thanh toán"}>
                <Radio.Group
                    value={order.paymentMethod}
                    onChange={_onChangePaymentMethod}
                    options={[
                        {value: ORDER_PAYMENT_METHOD.CASH_COD, label: ORDER_PAYMENT_METHOD.CASH_COD},
                        {
                            value: ORDER_PAYMENT_METHOD.BANK_TRANSFER_IN_ADVANCE,
                            label: ORDER_PAYMENT_METHOD.BANK_TRANSFER_IN_ADVANCE
                        },
                    ]}
                />
            </SmartForm.Item>
            <SmartForm.Item label={"Số tiền COD"}>
                <InputNumber style={{width: "100%"}} placeholder="Nhập số tiền COD"
                             value={order.codAmount}
                             onChange={_onChangeCODAmount}
                             formatter={(value) => `đ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}/>
            </SmartForm.Item>
            <SmartForm.Item label={"Phí vận chuyển"}>
                <InputNumber style={{width: "100%"}} placeholder="Nhập phí vận chuyển"
                             value={order.shippingCost}
                             onChange={_onChangeShippingCode}
                             formatter={(value) => `đ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}/>
            </SmartForm.Item>
        </SmartForm>
    </Modal>
}
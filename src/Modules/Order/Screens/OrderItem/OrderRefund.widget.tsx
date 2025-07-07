import React, { FunctionComponent, useEffect, useState } from "react";
import { Order } from "@store/Models/Order";
import { Modal } from "@components/Modal";
import { Space } from "@components/Layout/Space";
import { DollarOutlined, TruckOutlined } from "@ant-design/icons";
import { Stack } from "@components/Layout/Stack";
import { Typography } from "@components/Typography";
import { SmartForm } from "@components/SmartForm";
import { InputNumber } from "@components/Form/InputNumber";
import { useOrder } from "@hooks";
import { Button } from "@components/Button";
import { useModal } from "@components/Modal/ModalProvider";
import { useMessage } from "@components/Message";

type OrderRefundWidgetProps = {
    open: boolean;
    onClose: () => void;
    order: Order;
}

export const OrderRefundWidget: FunctionComponent<OrderRefundWidgetProps> = props => {
    const orderUtils = useOrder();
    const modal = useModal();
    const message = useMessage();
    const [amount, setAmount] = useState<number>(props.order.refundAmount);

    useEffect(() => {
        setAmount(props.order.refundAmount);
    }, [props.order])

    const _onSave = () => {
        orderUtils.refund(props.order.id, amount);
        message.success("Đã lưu số tiền hoàn");
        props.onClose();
    }

    return <Modal open={props.open} centered title={
        <Space>
            <DollarOutlined />
            {props.order.name}
        </Space>
    } destroyOnClose={true} onCancel={props.onClose} footer={<Stack fullwidth justify="flex-end">
        <Button type="primary" onClick={_onSave}>Lưu</Button>
    </Stack>}>
            <SmartForm.Item label="Hoàn tiền khách hàng">
                <InputNumber onChange={(value) => setAmount(value as any)} style={{ width: "100%" }}
                    placeholder="Nhập số tiền hoàn"
                    value={amount}
                    formatter={(value) => `đ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
            </SmartForm.Item>
    </Modal>
}
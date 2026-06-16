import { Space } from "@components/Layout/Space";
import { Modal } from "@components/Modal";
import { FunctionComponent, useEffect, useState } from "react";
import {
    BarcodeOutlined,
    CopyOutlined
} from "@ant-design/icons";
import { Input } from "antd";
import { Stack } from "@components/Layout/Stack";
import { Button } from "@components/Button";
import { Order } from "@store/Models/Order";
import { SmartForm } from "@components/SmartForm";

type ChangeShippingCodeWidgetProps = {
    order: Order;
    loading: boolean;
    value: string;
    open: boolean;
    onClose: () => void;
    onSave: (code: string) => void;
}

export const OrderChangeShippingCodeWidget: FunctionComponent<ChangeShippingCodeWidgetProps> = (props) => {
    const [code, setCode] = useState<string>(props.value);

    useEffect(() => {
        setCode(props.value);
    }, [props.value])

    const _onPaste = async () => {
        const text = await navigator.clipboard?.readText?.();
        if (text) setCode(text.trim());
    }

    return <Modal open={props.open} title={
        <Space>
            <BarcodeOutlined />
            {props.order.name}
        </Space>
    } destroyOnClose={true} onCancel={props.onClose} footer={<Stack fullwidth justify="flex-end">
        <Space>
            <Button icon={<CopyOutlined/>} onClick={_onPaste}>Dán mã</Button>
            <Button loading={props.loading} type="primary" onClick={() => props.onSave(code.trim())}>Lưu mã</Button>
        </Space>
    </Stack>}>
        <SmartForm.Item label="Mã vận đơn">
            <Input allowClear autoFocus placeholder="Nhập mã vận đơn" value={code} onChange={e => setCode(e.target.value)} />
        </SmartForm.Item>
    </Modal>
}

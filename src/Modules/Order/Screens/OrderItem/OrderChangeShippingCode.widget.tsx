import { Space } from "@components/Layout/Space";
import { Modal } from "@components/Modal";
import { FunctionComponent, useEffect, useRef, useState } from "react";
import {
    BarcodeOutlined
} from "@ant-design/icons";
import { Input } from "antd";
import { Stack } from "@components/Layout/Stack";
import { Button } from "@components/Button";
import { Order } from "@store/Models/Order";
import { SmartForm } from "@components/SmartForm";
import { Tag } from "@components/Tag";

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
    const [clipboardCode, setClipboardCode] = useState<string>("");
    const interval = useRef<NodeJS.Timer>(null);

    useEffect(() => {
        setCode(props.value);
    }, [props.value])

    useEffect(() => {
        if (props.open)
            interval.current = setInterval(() => {
                navigator.clipboard.readText().then(text => setClipboardCode(code => text));
            }, 500);
        else if (interval?.current) clearInterval(interval.current);

        return () => {
            if (interval?.current) clearInterval(interval.current);
        }
    }, [props.open])

    return <Modal open={props.open} title={
        <Space>
            <BarcodeOutlined />
            {props.order.name}
        </Space>
    } destroyOnClose={true} onCancel={props.onClose} footer={<Stack fullwidth justify="flex-end">
        <Button loading={props.loading} type="primary" onClick={() => props.onSave(code)}>Lưu mã</Button>
    </Stack>}>
        <SmartForm.Item label="Mã vận đơn">
            <Input allowClear autoFocus value={code} onChange={e => setCode(e.target.value)} />
        </SmartForm.Item>
        {Boolean(clipboardCode) && <Tag onClick={() => {
            setCode(clipboardCode);
        }}>{clipboardCode}</Tag>}
    </Modal>
}
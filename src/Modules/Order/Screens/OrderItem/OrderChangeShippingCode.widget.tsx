import { Space } from "@components/Layout/Space";
import { Modal } from "@components/Modal";
import { FunctionComponent, useEffect, useState } from "react";
import {
    BarcodeOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    CloseOutlined,
    CloudUploadOutlined,
    DeleteOutlined,
    DollarOutlined,
    DoubleLeftOutlined,
    EnvironmentOutlined,
    FileTextOutlined,
    MoreOutlined,
    PhoneOutlined,
    TruckOutlined,
    ToolOutlined
} from "@ant-design/icons";
import { Input } from "antd";
import { Stack } from "@components/Layout/Stack";
import { Button } from "@components/Button";

type ChangeShippingCodeWidgetProps = {
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

    return <Modal open={props.open} title={
        <Space>
            <BarcodeOutlined />
            Nhập mã vận đơn
        </Space>
    } destroyOnClose={true} onCancel={props.onClose} footer={<Stack fullwidth justify="flex-end">
        <Button type="primary" onClick={() => props.onSave(code)}>Lưu mã</Button>
    </Stack>}>
        <Input autoFocus value={code} onChange={e => setCode(e.target.value)} />
    </Modal>
}
import {Space} from "@components/Layout/Space";
import {Modal} from "@components/Modal";
import {FunctionComponent, useEffect, useState} from "react";
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
import {Input} from "antd";
import {Stack} from "@components/Layout/Stack";
import {Button} from "@components/Button";
import {Order} from "@store/Models/Order";
import {Typography} from "@components/Typography";

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

    return <Modal open={props.open} title={
        <Space>
            <BarcodeOutlined/>
            Mã vận đơn
        </Space>
    } destroyOnClose={true} onCancel={props.onClose} footer={<Stack fullwidth justify="flex-end">
        <Button loading={props.loading} type="primary" onClick={() => props.onSave(code)}>Lưu mã</Button>
    </Stack>}>
        <Typography.Title>{props.order.name}</Typography.Title>
        <Input allowClear autoFocus value={code} onChange={e => setCode(e.target.value)}/>
    </Modal>
}
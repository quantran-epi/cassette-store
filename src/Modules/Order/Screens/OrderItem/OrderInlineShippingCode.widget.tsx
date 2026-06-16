import React, {FunctionComponent, useEffect, useState} from "react";
import {BarcodeOutlined, CopyOutlined, SaveOutlined} from "@ant-design/icons";
import {Button} from "@components/Button";
import {Input} from "@components/Form/Input";
import {Space} from "@components/Layout/Space";
import {OrderWorkflowResult} from "@hooks";
import {Order} from "@store/Models/Order";

type OrderInlineShippingCodeWidgetProps = {
    order: Order;
    loading: boolean;
    value: string;
    disabled?: boolean;
    onSave: (code: string) => Promise<OrderWorkflowResult<unknown> | void>;
    onOpenModal?: () => void;
}

export const OrderInlineShippingCodeWidget: FunctionComponent<OrderInlineShippingCodeWidgetProps> = (props) => {
    const [code, setCode] = useState(props.value || "");

    useEffect(() => {
        setCode(props.value || "");
    }, [props.value])

    const _onPaste = async () => {
        const text = await navigator.clipboard?.readText?.();
        if (text) setCode(text.trim());
    }

    const _onSave = async () => {
        const shippingCode = code.trim();
        if (!shippingCode) return;

        const result = await props.onSave(shippingCode);
        if (result?.localUpdated) setCode("");
    }

    return <Space wrap>
        <BarcodeOutlined/>
        <Input
            allowClear
            disabled={props.disabled || props.loading}
            placeholder="Nhập mã vận đơn"
            value={code}
            onChange={e => setCode(e.target.value)}
            style={{width: 180}}
        />
        <Button
            size="small"
            icon={<CopyOutlined/>}
            disabled={props.disabled || props.loading}
            onClick={_onPaste}>
            Dán mã
        </Button>
        <Button
            size="small"
            type="primary"
            icon={<SaveOutlined/>}
            loading={props.loading}
            disabled={props.disabled || !code.trim()}
            onClick={_onSave}>
            Lưu mã
        </Button>
    </Space>
}

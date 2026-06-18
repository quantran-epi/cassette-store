import {
    BarcodeOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    CloseOutlined,
    DeleteOutlined,
    DollarOutlined,
    DoubleLeftOutlined,
    DoubleRightOutlined,
    DropboxOutlined,
    HighlightOutlined,
    MoreOutlined,
    PaperClipOutlined,
    RollbackOutlined,
    ToolOutlined,
    TruckOutlined,
    UserOutlined
} from "@ant-design/icons";
import {OrderActionDefinition, OrderActionKey, OrderActionModel} from "@common/Helpers/OrderActionHelper";
import {ActionButton, ActionButtonTone} from "@components/Button";
import {Dropdown} from "@components/Dropdown";
import {Space} from "@components/Layout/Space";
import {Tooltip} from "@components/Tootip";
import {Typography} from "@components/Typography";
import type {MenuProps} from "antd";
import React, {FunctionComponent} from "react";

type OrderActionSurfaceWidgetProps = {
    model: OrderActionModel;
    onAction: (key: OrderActionKey) => void;
}

const GROUP_LABELS: Record<string, string> = {
    delivery: "Giao hàng",
    details: "Chi tiết",
    customer: "Khách hàng",
    danger: "Nguy hiểm"
}

const _getIcon = (key: OrderActionKey): React.ReactNode => {
    switch (key) {
        case "mark-as-done":
            return <CheckCircleOutlined/>;
        case "mark-as-payed-cod":
            return <DollarOutlined/>;
        case "refuse-to-receive":
            return <CloseOutlined/>;
        case "broken-items":
            return <ToolOutlined/>;
        case "waiting-return-order":
            return <ClockCircleOutlined/>;
        case "returned-order":
            return <DoubleLeftOutlined/>;
        case "input-shipping-code":
            return <BarcodeOutlined/>;
        case "create-delivery-bill-helpers":
            return <HighlightOutlined/>;
        case "place-items":
            return <DropboxOutlined/>;
        case "priority":
            return <DoubleRightOutlined/>;
        case "file-attachment":
            return <PaperClipOutlined/>;
        case "order-bill":
            return <TruckOutlined/>;
        case "customer-info":
            return <UserOutlined/>;
        case "refund":
            return <RollbackOutlined/>;
        case "delete":
            return <DeleteOutlined/>;
        default:
            return <MoreOutlined/>;
    }
}

const _renderActionLabel = (action: OrderActionDefinition) => {
    if (!action.disabledReason) return action.label;

    return <Space direction="vertical" size={0} align="start">
        <Typography.Text>{action.label}</Typography.Text>
        <Typography.Text type="secondary" style={{fontSize: 12}}>{action.disabledReason}</Typography.Text>
    </Space>
}

const _toMenuItem = (action: OrderActionDefinition): NonNullable<MenuProps["items"]>[number] => ({
    key: action.key,
    label: _renderActionLabel(action),
    icon: _getIcon(action.key),
    danger: action.danger,
    disabled: action.disabled
});

const _getTone = (action: OrderActionDefinition): ActionButtonTone => {
    if (action.danger) return "danger";

    switch (action.key) {
        case "mark-as-done":
        case "mark-as-payed-cod":
            return "success";
        case "input-shipping-code":
        case "create-delivery-bill-helpers":
            return "primary";
        case "waiting-return-order":
        case "returned-order":
            return "warning";
        default:
            return "default";
    }
}

const _buildMenuItems = (model: OrderActionModel): MenuProps["items"] => {
    return Object.entries(model.groups).map(([group, actions]) => ({
        type: "group" as const,
        key: group,
        label: GROUP_LABELS[group] || group,
        children: actions
            .filter(action => action.key !== model.primaryAction?.key)
            .map(_toMenuItem)
    })).filter(group => group.children.length > 0);
}

export const OrderActionSurfaceWidget: FunctionComponent<OrderActionSurfaceWidgetProps> = ({model, onAction}) => {
    const menuItems = _buildMenuItems(model);

    return <div className="order-action-surface">
        {model.primaryAction && <Tooltip title={model.primaryAction.disabledReason || model.primaryAction.label}>
            <ActionButton
                tone={_getTone(model.primaryAction)}
                icon={_getIcon(model.primaryAction.key)}
                disabled={model.primaryAction.disabled}
                onClick={() => onAction(model.primaryAction.key)}>
                {model.primaryAction.label}
            </ActionButton>
        </Tooltip>}
        <Dropdown menu={{
            items: menuItems,
            onClick: e => onAction(e.key as OrderActionKey)
        }} placement="bottomRight">
            <ActionButton shape="circle" icon={<MoreOutlined/>} aria-label="Tác vụ khác"/>
        </Dropdown>
    </div>
}

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
    ToolOutlined,
    HighlightOutlined,
    PaperClipOutlined, DropboxOutlined, RollbackOutlined, DoubleRightOutlined
} from "@ant-design/icons";
import { COLORS, ORDER_PAYMENT_METHOD, ORDER_PRIORITY_STATUS, ORDER_STATUS } from "@common/Constants/AppConstants";
import { Button } from "@components/Button";
import { Dropdown } from "@components/Dropdown";
import { Space } from "@components/Layout/Space";
import { Stack } from "@components/Layout/Stack";
import { List } from "@components/List";
import { useMessage } from "@components/Message";
import { useModal } from "@components/Modal/ModalProvider";
import { Tag } from "@components/Tag";
import { Tooltip } from "@components/Tootip";
import { Typography } from "@components/Typography";
import { Order } from "@store/Models/Order";
import { editOrder, removeOrder } from "@store/Reducers/OrderReducer";
import { RootState } from "@store/Store";
import React, { FunctionComponent, useMemo } from "react";
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useDispatch, useSelector } from "react-redux";
import { useToggle, useOrder } from "@hooks";
import { Modal } from "@components/Modal";
import { Input } from "@components/Form/Input";
import { OrderChangeShippingCodeWidget } from "./OrderChangeShippingCode.widget";
import { OrderCreateDeliveryAssistantWidget } from "@modules/Order/Screens/OrderItem/OrderCreateDeliveryAssistant.widget";
import { OrderRefundWidget } from "@modules/Order/Screens/OrderItem/OrderRefund.widget";
import { OrderPlacedItemsWidget } from "@modules/Order/Screens/OrderItem/OrderPlacedItems.widget";
import { OrderShippinInfoWidget } from "@modules/Order/Screens/OrderItem/OrderShippingInfo.widget";
import { OrderAttachmentsWidget } from "@modules/Order/Screens/OrderItem/OrderAttachments.widget";
import { OrderPriorityWidget } from "./OrderPriority.widget";

type OrderItemProps = {
    item: Order;
    onDelete: (item: Order) => void;
}

export const OrderItemWidget: React.FunctionComponent<OrderItemProps> = (props) => {
    const customers = useSelector((state: RootState) => state.customer.customers);
    const dispatch = useDispatch();
    const message = useMessage();
    const modal = useModal();
    const toggleInputShippingCodeEditor = useToggle();
    const toggleLoadingChangeShippingCode = useToggle();
    const toggleOrderCreateDeliveryAssistant = useToggle();
    const toggleOrderPlacedItems = useToggle();
    const toggleOrderShippingInfo = useToggle();
    const toggleOrderRefund = useToggle();
    const toggleOrderAttachment = useToggle();
    const toggleOrderPriority = useToggle();
    const orderCustomer = useMemo(() => {
        return customers.find(e => e.id == props.item.customerId);
    }, [props.item.customerId])
    const orderUtils = useOrder();

    const _renderOrderIcon = () => {
        if (orderCustomer.isVIP) return <Tag color={COLORS.CUSTOMER.VIP}>VIP</Tag>;
        return undefined;
    }

    const _renderOrderStatus = () => {
        switch (props.item.status) {
            case ORDER_STATUS.PLACED:
                return <Tag>{props.item.status}</Tag>;
            case ORDER_STATUS.SHIPPED:
                return <Tag color={COLORS.ORDER_STATUS.SHIPPED}>{props.item.status}</Tag>;
            case ORDER_STATUS.RETURNED:
                return <Tag color={COLORS.ORDER_STATUS.RETURNED}>{props.item.status}</Tag>;
            case ORDER_STATUS.NEED_RETURN:
                return <Tag color={COLORS.ORDER_STATUS.NEED_RETURN}>{props.item.status}</Tag>;
            case ORDER_STATUS.CREATE_DELIVERY:
                return <Tag color={COLORS.ORDER_STATUS.CREATE_DELIVERY}>{props.item.status}</Tag>;
            case ORDER_STATUS.WAITING_FOR_RETURNED:
                return <Tag color={COLORS.ORDER_STATUS.WAITING_FOR_RETURNED}>{props.item.status}</Tag>;
            default:
                return undefined;
        }
    }

    const _renderReturnReason = () => {
        return <Tag color={COLORS.RETURN_REASON}>{props.item.returnReason}</Tag>;
    }

    const _renderCODAmount = () => {
        switch (props.item.paymentMethod) {
            case ORDER_PAYMENT_METHOD.CASH_COD:
                return <CopyToClipboard text={props.item.codAmount}
                    onCopy={() => message.success("Đã sao chép số tiền COD")}>
                    <Tag color={COLORS.PAYMENT_METHOD.COD}>COD {props.item.codAmount.toLocaleString()}đ</Tag>
                </CopyToClipboard>;
            case ORDER_PAYMENT_METHOD.BANK_TRANSFER_IN_ADVANCE:
                return <Tag color={COLORS.PAYMENT_METHOD.BANK_TRANSFER_IN_ADVANCE}>Bank</Tag>;
            default:
                return undefined;
        }
    }

    const _renderPriority = () => {
        switch (props.item.priorityStatus) {
            case ORDER_PRIORITY_STATUS.PRIORITY: return <Tag color={COLORS.PRIORITY_STATUS.PRIORITY}>Ưu tiên</Tag>
            case ORDER_PRIORITY_STATUS.URGENT: return <Tag color={COLORS.PRIORITY_STATUS.URGENT}>Gấp</Tag>
            default: return undefined;
        }
    }

    const _removeOrder = () => {
        dispatch(removeOrder([props.item.id]));
    }

    const _onMoreActionClick = async (e) => {
        switch (e.key) {
            case "place-items":
                toggleOrderPlacedItems.show();
                break;
            case "refund":
                toggleOrderRefund.show();
                break;
            case "create-delivery-bill-helpers":
                toggleOrderCreateDeliveryAssistant.show();
                break;
            case "input-shipping-code":
                toggleInputShippingCodeEditor.show();
                break;
            case "order-bill":
                toggleOrderShippingInfo.show();
                break;
            case "file-attachment":
                toggleOrderAttachment.show();
                break;
            case "priority": toggleOrderPriority.show(); break;
            case "delete":
                modal.confirm({
                    title: "Chắc chắn muốn xoá đơn hàng này?",
                    cancelText: "Huỷ",
                    onOk: () => _removeOrder()
                })
                break;
        }
    }

    const _onDeliveryActionClick = async (e) => {
        switch (e.key) {
            case "mark-as-done":
                modal.confirm({
                    title: "Đánh dấu đơn là thành công, thao tác này không thể chỉnh sửa?",
                    cancelText: "Huỷ",
                    onOk: async () => {
                        let error = await orderUtils.markOrderAsShipped(props.item.id);
                        if (error) message.error(error);
                        else message.success("Đã đánh dấu đơn hoàn thành");
                    }
                })
                break;
            case "refuse-to-receive":
                modal.confirm({
                    title: "Đánh dấu đơn là bị bom hàng?",
                    cancelText: "Huỷ",
                    onOk: async () => {
                        let error = await orderUtils.markOrderAsRefuseToReceive(props.item.id);
                        if (error) message.error(error);
                        else message.success("Đã đánh dấu đơn bom");
                    }
                })
                break;
            case "waiting-return-order":
                orderUtils.markOrderAsWaitingForReturn(props.item.id);
                break;
            case "returned-order":
                orderUtils.markOrderAsReturned(props.item.id);
                break;
            case "broken-items":
                modal.confirm({
                    title: "Đánh dấu đơn là hàng lỗi?",
                    cancelText: "Huỷ",
                    onOk: async () => {
                        let error = await orderUtils.markOrderAsBrokenItems(props.item.id);
                        if (error) message.error(error);
                        else message.success("Đã đánh dấu đơn hàng lỗi");
                    }
                })
                break;
        }
    }

    const _onChangeShippingCode = async (value: string) => {
        toggleLoadingChangeShippingCode.show();
        let error = await orderUtils.changeShippingCode(props.item.id, value);
        toggleLoadingChangeShippingCode.hide();
        if (error) message.error(error);
        else {
            toggleInputShippingCodeEditor.hide();
            message.success("Lưu mã vận đơn thành công");
        }
    }

    return <React.Fragment>
        <List.Item
            actions={
                [
                    orderUtils.isShipped(props.item.id) ? undefined : <Dropdown menu={{
                        items: [
                            {
                                label: 'Đã giao hàng',
                                key: 'mark-as-done',
                                icon: <CheckCircleOutlined />,
                                disabled: !orderUtils.canMarkAsShipped(props.item.id)
                            },
                            {
                                label: 'Bom hàng',
                                key: 'refuse-to-receive',
                                icon: <CloseOutlined />,
                                danger: true,
                                disabled: orderUtils.isRefuseToReceive(props.item.id)
                            },
                            {
                                label: 'Hàng lỗi, hoàn về',
                                key: 'broken-items',
                                icon: <ToolOutlined />,
                                danger: true,
                                disabled: orderUtils.isBrokenItems(props.item.id)
                            },
                            {
                                label: 'Chờ chuyển hoàn',
                                key: 'waiting-return-order',
                                icon: <ClockCircleOutlined />,
                                disabled: !orderUtils.canMarkAsWaitingForReturn(props.item.id)
                            },
                            {
                                label: 'Đã chuyển hoàn',
                                key: 'returned-order',
                                icon: <DoubleLeftOutlined />,
                                disabled: !orderUtils.canMarkAsReturned(props.item.id)
                            }
                        ],
                        onClick: _onDeliveryActionClick
                    }} placement="bottom">
                        <Button size="small" icon={<TruckOutlined />} />
                    </Dropdown>,
                    <Dropdown menu={{
                        items: [
                            {
                                label: 'Mã vận đơn',
                                key: 'input-shipping-code',
                                icon: <BarcodeOutlined />,
                                disabled: !orderUtils.isPushedTrello(props.item.id)
                            },
                            {
                                label: 'Hỗ trợ nhập đơn',
                                key: 'create-delivery-bill-helpers',
                                icon: <HighlightOutlined />,
                            },
                            {
                                label: 'Danh sách hàng hoá',
                                key: 'place-items',
                                icon: <DropboxOutlined />,
                            },
                            {
                                label: 'Độ ưu tiên',
                                key: 'priority',
                                icon: <DoubleRightOutlined />,
                            },
                            {
                                label: 'Ảnh đính kèm',
                                key: 'file-attachment',
                                icon: <PaperClipOutlined />,
                            },
                            {
                                label: 'Vận chuyển',
                                key: 'order-bill',
                                icon: <TruckOutlined />,
                            },
                            {
                                label: 'Hoàn tiền khách',
                                key: 'refund',
                                icon: <RollbackOutlined />,
                            },
                            {
                                label: 'Xoá đơn hàng',
                                key: 'delete',
                                icon: <DeleteOutlined />,
                                danger: true
                            },
                        ],
                        onClick: _onMoreActionClick
                    }} placement="bottom">
                        <Button size="small" icon={<MoreOutlined />} />
                    </Dropdown>
                ]
            }>
            <List.Item.Meta
                title={<Stack>
                    <Tooltip title={props.item.name}>
                        <Button onClick={() => null}
                            type="text"
                            style={{ paddingLeft: 0, fontWeight: "bold" }}>
                            <Space>
                                <Typography.Text>{props.item.name}</Typography.Text>
                                {_renderOrderIcon()}
                            </Space>
                        </Button>
                    </Tooltip>
                </Stack>}
                description={<Stack direction={"column"} align={"flex-start"} gap={4}>
                    <Space size={0}>
                        {_renderOrderStatus()}
                        {props.item.returnReason && _renderReturnReason()}
                        {props.item.priorityStatus !== ORDER_PRIORITY_STATUS.NONE && _renderPriority()}
                    </Space>
                    <Stack gap={2} direction="column" align={"flex-start"}>
                        <Space>
                            <DollarOutlined />
                            <Space>
                                <Typography.Text>Thu {props.item.paymentAmount.toLocaleString()}đ</Typography.Text>
                                {_renderCODAmount()}
                            </Space>
                        </Space>
                        {props.item.isFreeShip && <Space>
                            <TruckOutlined />
                            <Typography.Text style={{ color: COLORS.FREE_SHIP }}>Miễn phí vận chuyển</Typography.Text>
                        </Space>}
                        {Boolean(props.item.shippingCode) && <CopyToClipboard text={props.item.shippingCode}
                                onCopy={() => message.success("Đã sao chép mã vận đơnn")}>
                                <Space>
                                    <BarcodeOutlined />
                                    <Typography.Paragraph ellipsis style={{
                                        width: 300,
                                        marginBottom: 0,
                                        color: COLORS.ORDER_STATUS.CREATE_DELIVERY
                                    }}>{props.item.shippingCode}</Typography.Paragraph>
                                </Space>
                            </CopyToClipboard>}
                        {orderCustomer && <React.Fragment>
                            <CopyToClipboard text={orderCustomer.mobile}
                                onCopy={() => message.success("Đã sao chép số điện thoại")}>
                                <Space>
                                    <PhoneOutlined />
                                    <Typography.Paragraph ellipsis style={{
                                        width: 300,
                                        marginBottom: 0
                                    }}>{orderCustomer.mobile}</Typography.Paragraph>
                                </Space>
                            </CopyToClipboard>
                            <CopyToClipboard text={orderCustomer.address}
                                onCopy={() => message.success("Đã sao chép địa chỉ")}>
                                <Tooltip title={orderCustomer.address}>
                                    <Space>
                                        <EnvironmentOutlined />
                                        <Typography.Paragraph ellipsis style={{
                                            width: 300,
                                            marginBottom: 0
                                        }}>{orderCustomer.address}</Typography.Paragraph>
                                    </Space>
                                </Tooltip>
                            </CopyToClipboard>
                        </React.Fragment>}
                    </Stack>
                </Stack>} />
        </List.Item>

        <OrderChangeShippingCodeWidget
            loading={toggleLoadingChangeShippingCode.value}
            open={toggleInputShippingCodeEditor.value}
            onClose={toggleInputShippingCodeEditor.hide}
            value={props.item.shippingCode}
            onSave={_onChangeShippingCode} />

        <OrderCreateDeliveryAssistantWidget open={toggleOrderCreateDeliveryAssistant.value}
            onClose={toggleOrderCreateDeliveryAssistant.hide}
            order={props.item} customer={orderCustomer} />
        <OrderRefundWidget open={toggleOrderRefund.value}
            onClose={toggleOrderRefund.hide}
            order={props.item} />

        <OrderPlacedItemsWidget open={toggleOrderPlacedItems.value}
            onClose={toggleOrderPlacedItems.hide}
            order={props.item} />

        <OrderShippinInfoWidget open={toggleOrderShippingInfo.value}
            onClose={toggleOrderShippingInfo.hide}
            order={props.item} />

        <OrderAttachmentsWidget open={toggleOrderAttachment.value}
            onClose={toggleOrderAttachment.hide}
            order={props.item} />

        <OrderPriorityWidget open={toggleOrderPriority.value}
            onClose={toggleOrderPriority.hide}
            order={props.item} />

    </React.Fragment>
}


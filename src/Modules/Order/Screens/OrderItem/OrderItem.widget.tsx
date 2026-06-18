import {
    BarcodeOutlined,
    CalendarOutlined,
    DollarOutlined,
    EnvironmentOutlined,
    PhoneOutlined,
    TruckOutlined
} from "@ant-design/icons";
import { COLORS, ORDER_PAYMENT_METHOD, ORDER_PRIORITY_STATUS, ORDER_STATUS } from "@common/Constants/AppConstants";
import {buildOrderActionModel, OrderActionKey} from "@common/Helpers/OrderActionHelper";
import { List } from "@components/List";
import { useMessage } from "@components/Message";
import { useModal } from "@components/Modal/ModalProvider";
import { Tag } from "@components/Tag";
import {Tooltip} from "@components/Tootip";
import { Typography } from "@components/Typography";
import { Order } from "@store/Models/Order";
import {removeOrder} from "@store/Reducers/OrderReducer";
import { RootState } from "@store/Store";
import React, {useMemo} from "react";
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useDispatch, useSelector } from "react-redux";
import { getOrderWorkflowMessage, hasOrderWorkflowSyncFailures, OrderWorkflowResult, useToggle, useOrder } from "@hooks";
import { OrderChangeShippingCodeWidget } from "./OrderChangeShippingCode.widget";
import { OrderCreateDeliveryAssistantWidget } from "@modules/Order/Screens/OrderItem/OrderCreateDeliveryAssistant.widget";
import { OrderRefundWidget } from "@modules/Order/Screens/OrderItem/OrderRefund.widget";
import { OrderPlacedItemsWidget } from "@modules/Order/Screens/OrderItem/OrderPlacedItems.widget";
import { OrderShippinInfoWidget } from "@modules/Order/Screens/OrderItem/OrderShippingInfo.widget";
import { OrderAttachmentsWidget } from "@modules/Order/Screens/OrderItem/OrderAttachments.widget";
import { OrderPriorityWidget } from "./OrderPriority.widget";
import moment from "moment";
import { OrderCustomerInfoWidget } from "@modules/Order/Screens/OrderItem/OrderCustomerInfo.widget";
import { OrderSyncStatusWidget } from "@modules/Order/Screens/OrderItem/OrderSyncStatus.widget";
import { OrderInlineShippingCodeWidget } from "@modules/Order/Screens/OrderItem/OrderInlineShippingCode.widget";
import {OrderActionSurfaceWidget} from "@modules/Order/Screens/OrderItem/OrderActionSurface.widget";
import "./OrderItem.widget.css";

type OrderItemProps = {
    item: Order;
    onDelete: (item: Order) => void;
}

const DELIVERY_ACTION_KEYS: OrderActionKey[] = [
    "mark-as-done",
    "mark-as-payed-cod",
    "refuse-to-receive",
    "broken-items",
    "waiting-return-order",
    "returned-order"
];

const TOOLTIP_DELAY = 0.35;

export const OrderItemWidget: React.FunctionComponent<OrderItemProps> = (props) => {
    const customers = useSelector((state: RootState) => state.customer.customers);
    const orders = useSelector((state: RootState) => state.order.orders);
    const doneOrders = useSelector((state: RootState) => state.order.doneOrders);
    const syncFailures = useSelector((state: RootState) => state.order.syncFailures);
    const dispatch = useDispatch();
    const message = useMessage();
    const modal = useModal();
    const toggleInputShippingCodeEditor = useToggle();
    const toggleLoadingChangeShippingCode = useToggle();
    const toggleOrderCreateDeliveryAssistant = useToggle();
    const toggleOrderCustomerInfo = useToggle();
    const toggleOrderPlacedItems = useToggle();
    const toggleOrderShippingInfo = useToggle();
    const toggleOrderRefund = useToggle();
    const toggleOrderAttachment = useToggle();
    const toggleOrderPriority = useToggle();
    const orderCustomer = useMemo(() => {
        return customers.find(e => e.id === props.item.customerId);
    }, [customers, props.item.customerId])
    const orderSyncFailures = useMemo(() => {
        return (syncFailures || []).filter(failure => failure.orderId === props.item.id);
    }, [syncFailures, props.item.id])
    const orderUtils = useOrder();

    const _getCustomerColor = () => {
        if (!orderCustomer) return undefined;

        if (orderCustomer.isVIP) return COLORS.CUSTOMER.VIP;
        else if (orderCustomer.buyCount > 3) return COLORS.CUSTOMER.BUY_MUTIPLE_TIMES;
        else if (orderCustomer.buyCount > 0) return COLORS.CUSTOMER.CONFIRMED;
        else return undefined;
    }

    const _getStatusClassName = () => {
        switch (props.item.status) {
            case ORDER_STATUS.SHIPPED:
                return "order-list-item--shipped";
            case ORDER_STATUS.RETURNED:
                return "order-list-item--returned";
            case ORDER_STATUS.CREATE_DELIVERY:
                return "order-list-item--delivery";
            case ORDER_STATUS.WAITING_FOR_RETURNED:
                return "order-list-item--waiting-return";
            default:
                return "order-list-item--placed";
        }
    }

    const _renderOrderStatus = () => {
        switch (props.item.status) {
            case ORDER_STATUS.PLACED:
                return <Tag>{props.item.status}</Tag>;
            case ORDER_STATUS.SHIPPED:
                return <Tag color={COLORS.ORDER_STATUS.SHIPPED}>{"Giao thành công"}</Tag>;
            case ORDER_STATUS.RETURNED:
                return <Tag color={COLORS.ORDER_STATUS.RETURNED}>{props.item.status}</Tag>;
            case ORDER_STATUS.CREATE_DELIVERY:
                return <Tag color={COLORS.ORDER_STATUS.CREATE_DELIVERY}>{props.item.status}</Tag>;
            case ORDER_STATUS.WAITING_FOR_RETURNED:
                return <Tag color={COLORS.ORDER_STATUS.WAITING_FOR_RETURNED}>{props.item.status}</Tag>;
            default:
                return undefined;
        }
    }

    const _renderIsPayCOD = () => {
        return props.item.isPayCOD && <Tag color={COLORS.ORDER_STATUS.PAY_COD}>Đã trả COD</Tag>
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
                return <Tag color={COLORS.PAYMENT_METHOD.BANK_TRANSFER_IN_ADVANCE}>Chuyển khoản</Tag>;
            default:
                return undefined;
        }
    }

    const _renderPriority = () => {
        switch (props.item.priorityStatus) {
            case ORDER_PRIORITY_STATUS.PRIORITY:
                return <Tag color={COLORS.PRIORITY_STATUS.PRIORITY}>Ưu tiên</Tag>
            case ORDER_PRIORITY_STATUS.URGENT:
                return <Tag color={COLORS.PRIORITY_STATUS.URGENT}>Gấp</Tag>
            default:
                return undefined;
        }
    }

    const _removeOrder = () => {
        dispatch(removeOrder([props.item.id]));
    }

    const _showWorkflowResult = (result: OrderWorkflowResult<unknown>, successMessage: string) => {
        if (!result.localUpdated) message.error(getOrderWorkflowMessage(result));
        else if (hasOrderWorkflowSyncFailures(result)) message.warning(getOrderWorkflowMessage(result));
        else message.success(successMessage);
    }

    const actionModel = buildOrderActionModel(props.item, {
        isPushedTrello: orderUtils.isPushedTrello(props.item.id),
        canMarkAsShipped: orderUtils.canMarkAsShipped(props.item.id),
        canMarkAsPayCOD: orderUtils.canMarkAsPayCOD(props.item.id),
        canMarkAsWaitingForReturn: orderUtils.canMarkAsWaitingForReturn(props.item.id),
        canMarkAsReturned: orderUtils.canMarkAsReturned(props.item.id),
        isRefuseToReceive: orderUtils.isRefuseToReceive(props.item.id),
        isBrokenItems: orderUtils.isBrokenItems(props.item.id),
        hasShippingCode: Boolean(props.item.shippingCode),
        doneInTrello: doneOrders?.includes(props.item.trelloCardId)
    });

    const _onMoreActionClick = async (key: OrderActionKey) => {
        switch (key) {
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
            case "priority":
                toggleOrderPriority.show();
                break;
            case "delete":
                modal.confirm({
                    title: "Chắc chắn muốn xoá đơn hàng này?",
                    cancelText: "Huỷ",
                    onOk: () => _removeOrder()
                })
                break;
            case "customer-info":
                toggleOrderCustomerInfo.show();
                break;
        }
    }

    const _onDeliveryActionClick = async (key: OrderActionKey) => {
        switch (key) {
            case "mark-as-done":
                modal.confirm({
                    title: "Đánh dấu đơn là thành công, thao tác này không thể chỉnh sửa?",
                    cancelText: "Huỷ",
                    onOk: async () => {
                        let result = await orderUtils.markOrderAsShipped(props.item.id);
                        _showWorkflowResult(result, "Đã đánh dấu đơn hoàn thành");
                    }
                })
                break;
            case "mark-as-payed-cod":
                modal.confirm({
                    title: "Đánh dấu đơn là đã trả COD, thao tác này không thể chỉnh sửa?",
                    cancelText: "Huỷ",
                    onOk: async () => {
                        orderUtils.markOrderAsPayCOD(props.item.id);
                        message.success("Đã đánh dấu đơn là đã trả COD")
                    }
                })
                break;
            case "refuse-to-receive":
                modal.confirm({
                    title: "Đánh dấu đơn là bị bom hàng?",
                    cancelText: "Huỷ",
                    onOk: async () => {
                        let result = await orderUtils.markOrderAsRefuseToReceive(props.item.id);
                        _showWorkflowResult(result, "Đã đánh dấu đơn bom");
                    }
                })
                break;
            case "waiting-return-order":
                orderUtils.markOrderAsWaitingForReturn(props.item.id);
                break;
            case "returned-order":
                modal.confirm({
                    title: "Đánh dấu đơn là đã chuyển hoàn?",
                    cancelText: "Huỷ",
                    onOk: async () => {
                        orderUtils.markOrderAsReturned(props.item.id);
                    }
                })
                break;
            case "broken-items":
                modal.confirm({
                    title: "Đánh dấu đơn là hàng lỗi?",
                    cancelText: "Huỷ",
                    onOk: async () => {
                        let result = await orderUtils.markOrderAsBrokenItems(props.item.id);
                        _showWorkflowResult(result, "Đã đánh dấu đơn hàng lỗi");
                    }
                })
                break;
        }
    }

    const _onActionClick = (key: OrderActionKey) => {
        if (DELIVERY_ACTION_KEYS.includes(key)) _onDeliveryActionClick(key);
        else _onMoreActionClick(key);
    }

    const _onChangeShippingCode = async (value: string): Promise<OrderWorkflowResult<unknown>> => {
        toggleLoadingChangeShippingCode.show();
        let result = await orderUtils.changeShippingCode(props.item.id, value);
        toggleLoadingChangeShippingCode.hide();
        if (result.localUpdated) {
            toggleInputShippingCodeEditor.hide();
        }
        _showWorkflowResult(result, "Lưu mã vận đơn thành công");
        return result;
    }

    const _onFirstAddShippingCode = () => {
        toggleInputShippingCodeEditor.show();
    }

    const _getBuyAmount = () => {
        return orders.filter(e => e.status === ORDER_STATUS.SHIPPED && e.customerId === props.item.customerId).reduce((prev, cur) => prev + cur.paymentAmount, 0);
    }

    const _getOrderTitleText = () => {
        if (!orderCustomer) return props.item.name;

        return `${props.item.name} (${orderCustomer.buyCount} đơn - ${_getBuyAmount().toLocaleString()}đ)`;
    }

    const _renderTooltipText = (text: string | number, className?: string, style?: React.CSSProperties) => {
        const normalizedText = String(text || "");

        if (!normalizedText) return null;

        return <Tooltip title={normalizedText} mouseEnterDelay={TOOLTIP_DELAY} placement="topLeft">
            <Typography.Text className={["order-list-item__clip", className].filter(Boolean).join(" ")} style={style}>
                {normalizedText}
            </Typography.Text>
        </Tooltip>
    }

    const _renderOrderTitle = () => {
        return _renderTooltipText(
            _getOrderTitleText(),
            "order-list-item__order-title",
            {color: _getCustomerColor()}
        )
    }

    const _renderInfoPill = (label: string, icon: React.ReactNode, content: React.ReactNode, className?: string) => {
        return <div className={["order-list-item__info", className].filter(Boolean).join(" ")}>
            <span className="order-list-item__info-icon">{icon}</span>
            <span className="order-list-item__info-label">{label}</span>
            <span className="order-list-item__info-value">{content}</span>
        </div>
    }

    const isDoneOrder = doneOrders?.includes(props.item.trelloCardId);
    const shouldShowInlineShippingCode = !props.item.shippingCode
        && props.item.status === ORDER_STATUS.PLACED
        && orderUtils.isPushedTrello(props.item.id);

    return <React.Fragment>
        <List.Item className={["order-list-item", _getStatusClassName()].join(" ")}>
            <div className="order-list-item__status-rail" aria-hidden="true"/>
            <div className="order-list-item__body">
                <div className="order-list-item__main">
                    <div className="order-list-item__summary">
                        <div className="order-list-item__title-row">
                            {isDoneOrder && <Tag color={COLORS.ORDER_STATUS.CREATE_DELIVERY}>Tạo đơn</Tag>}
                            {_renderOrderTitle()}
                        </div>
                        <div className="order-list-item__status-row">
                            <div className="order-list-item__tags">
                                {_renderOrderStatus()}
                                {_renderIsPayCOD()}
                                {props.item.returnReason && _renderReturnReason()}
                                {props.item.priorityStatus !== ORDER_PRIORITY_STATUS.NONE && _renderPriority()}
                            </div>
                            <span className="order-list-item__date">
                                <CalendarOutlined/>
                                {moment(new Date(props.item.createdDate)).format("DD-MM-yyyy")}
                            </span>
                        </div>
                    </div>

                    <div className="order-list-item__payment">
                        <span className="order-list-item__payment-label">Thu</span>
                        <Typography.Text className="order-list-item__payment-value">
                            {props.item.paymentAmount.toLocaleString()}đ
                        </Typography.Text>
                        <div className="order-list-item__payment-tags">
                            {_renderCODAmount()}
                            {props.item.isFreeShip && <Tag color={COLORS.FREE_SHIP}>Freeship</Tag>}
                        </div>
                    </div>

                    <div className="order-list-item__actions">
                        <OrderActionSurfaceWidget model={actionModel} onAction={_onActionClick}/>
                    </div>
                </div>

                <div className="order-list-item__sync">
                    <OrderSyncStatusWidget failures={orderSyncFailures}/>
                </div>

                <div className="order-list-item__info-grid">
                    {Boolean(props.item.shippingCode) && _renderInfoPill(
                        "Vận đơn",
                        <BarcodeOutlined/>,
                        <CopyToClipboard text={props.item.shippingCode}
                            onCopy={() => message.success("Đã sao chép mã vận đơnn")}>
                            <span className="order-list-item__copy-target">
                                {_renderTooltipText(props.item.shippingCode, "order-list-item__tracking-code")}
                            </span>
                        </CopyToClipboard>,
                        "order-list-item__info--tracking"
                    )}
                    {orderCustomer && _renderInfoPill(
                        "Điện thoại",
                        <PhoneOutlined/>,
                        <CopyToClipboard text={orderCustomer.mobile}
                            onCopy={() => message.success("Đã sao chép số điện thoại")}>
                            <span className="order-list-item__copy-target">
                                {_renderTooltipText(orderCustomer.mobile)}
                            </span>
                        </CopyToClipboard>
                    )}
                    {orderCustomer && _renderInfoPill(
                        "Địa chỉ",
                        <EnvironmentOutlined/>,
                        <CopyToClipboard text={orderCustomer.address}
                            onCopy={() => message.success("Đã sao chép địa chỉ")}>
                            <span className="order-list-item__copy-target">
                                {_renderTooltipText(orderCustomer.address)}
                            </span>
                        </CopyToClipboard>,
                        "order-list-item__info--address"
                    )}
                    {props.item.isFreeShip && _renderInfoPill(
                        "Vận chuyển",
                        <TruckOutlined/>,
                        <Typography.Text style={{ color: COLORS.FREE_SHIP }}>Miễn phí vận chuyển</Typography.Text>
                    )}
                    {_renderInfoPill(
                        "Thanh toán",
                        <DollarOutlined/>,
                        <Typography.Text>{props.item.paymentMethod}</Typography.Text>
                    )}
                </div>

                {shouldShowInlineShippingCode && <div className="order-list-item__inline-shipping">
                    <OrderInlineShippingCodeWidget
                        loading={toggleLoadingChangeShippingCode.value}
                        value={props.item.shippingCode}
                        disabled={!orderUtils.isPushedTrello(props.item.id)}
                        onSave={_onChangeShippingCode}/>
                </div>}
            </div>
        </List.Item>

        <OrderChangeShippingCodeWidget
            order={props.item}
            loading={toggleLoadingChangeShippingCode.value}
            open={toggleInputShippingCodeEditor.value}
            onClose={toggleInputShippingCodeEditor.hide}
            value={props.item.shippingCode}
            onSave={_onChangeShippingCode} />

        <OrderCreateDeliveryAssistantWidget open={toggleOrderCreateDeliveryAssistant.value}
            onClose={toggleOrderCreateDeliveryAssistant.hide}
            order={props.item} customer={orderCustomer}
            onAddShippingCode={_onFirstAddShippingCode} />

        <OrderRefundWidget open={toggleOrderRefund.value}
            onClose={toggleOrderRefund.hide}
            order={props.item} />

        <OrderPlacedItemsWidget
            open={toggleOrderPlacedItems.value}
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

        <OrderCustomerInfoWidget open={toggleOrderCustomerInfo.value}
            onClose={toggleOrderCustomerInfo.hide}
            order={props.item} customer={orderCustomer} />
    </React.Fragment>
}

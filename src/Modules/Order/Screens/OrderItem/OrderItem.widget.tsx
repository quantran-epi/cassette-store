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
import {COLORS, ORDER_PAYMENT_METHOD, ORDER_STATUS} from "@common/Constants/AppConstants";
import {Button} from "@components/Button";
import {Dropdown} from "@components/Dropdown";
import {Space} from "@components/Layout/Space";
import {Stack} from "@components/Layout/Stack";
import {List} from "@components/List";
import {useMessage} from "@components/Message";
import {useModal} from "@components/Modal/ModalProvider";
import {Popconfirm} from "@components/Popconfirm";
import {Tag} from "@components/Tag";
import {Tooltip} from "@components/Tootip";
import {Typography} from "@components/Typography";
import {Order} from "@store/Models/Order";
import {removeOrder} from "@store/Reducers/OrderReducer";
import {RootState} from "@store/Store";
import React, {FunctionComponent, useMemo} from "react";
import {CopyToClipboard} from 'react-copy-to-clipboard';
import {useDispatch, useSelector} from "react-redux";
import {useToggle, useOrder} from "@hooks";
import {Modal} from "@components/Modal";
import {Input} from "@components/Form/Input";
import {OrderChangeShippingCodeWidget} from "./OrderChangeShippingCode.widget";

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
                return <Tag color={COLORS.PAYMENT_METHOD.COD}>COD</Tag>;
            case ORDER_PAYMENT_METHOD.BANK_TRANSFER_IN_ADVANCE:
                return <Tag color={COLORS.PAYMENT_METHOD.BANK_TRANSFER_IN_ADVANCE}>Bank</Tag>;
            default:
                return undefined;
        }
    }

    const _removeOrder = () => {
        dispatch(removeOrder([props.item.id]));
    }

    const _onMoreActionClick = async (e) => {
        switch (e.key) {
            case "push-trello":
                modal.confirm({
                    title: "Đẩy đơn lên danh sách cần làm trên Trello?",
                    cancelText: "Huỷ",
                    onOk: async () => {
                        let trelloCard = await orderUtils.pushToTrelloToDoList(props.item.id);
                        if (!trelloCard) message.error("Lỗi đẩy đơn lên Trello");
                        else message.success("Đã đẩy đơn lên Trello");
                    }
                })
                break;
            case "place-items":
                break;
            case "input-shipping-code":
                toggleInputShippingCodeEditor.show();
                break;
            case "delivery-bill":
                break;
            case "delete":
                modal.confirm({
                    title: "Chắc chắn muốn xoá đơn hàng này?",
                    cancelText: "Huỷ",
                    onOk: () => _removeOrder()
                })
                break;
        }
    }

    const _onDeliveryActionClick = (e) => {
        switch (e.key) {
            case "mark-as-done":
                modal.confirm({
                    title: "Đánh dấu đơn là thành công, thao tác này không thể chỉnh sửa?",
                    cancelText: "Huỷ",
                    onOk: () => {
                        let error = orderUtils.markOrderAsShipped(props.item.id);
                        if (error) message.error(error);
                        else message.success("Đã đánh dấu đơn bom");
                    }
                })
                break;
            case "refuse-to-receive":
                modal.confirm({
                    title: "Đánh dấu đơn là bị bom hàng?",
                    cancelText: "Huỷ",
                    onOk: () => {
                        let error = orderUtils.markOrderAsRefuseToReceive(props.item.id);
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
                    onOk: () => {
                        let error = orderUtils.markOrderAsBrokenItems(props.item.id);
                        if (error) message.error(error);
                        else message.success("Đã đánh dấu đơn hàng lỗi");
                    }
                })
                break;
        }
    }

    const _onChangeShippingCode = async (value: string) => {
        let error = await orderUtils.changeShippingCode(props.item.id, value);
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
                                icon: <CheckCircleOutlined/>,
                                disabled: !orderUtils.canMarkAsShipped(props.item.id)
                            },
                            {
                                label: 'Bom hàng',
                                key: 'refuse-to-receive',
                                icon: <CloseOutlined/>,
                                danger: true,
                                disabled: orderUtils.isRefuseToReceive(props.item.id)
                            },
                            {
                                label: 'Hàng lỗi, hoàn về',
                                key: 'broken-items',
                                icon: <ToolOutlined/>,
                                danger: true,
                                disabled: orderUtils.isBrokenItems(props.item.id)
                            },
                            {
                                label: 'Chờ chuyển hoàn',
                                key: 'waiting-return-order',
                                icon: <ClockCircleOutlined/>,
                                disabled: !orderUtils.canMarkAsWaitingForReturn(props.item.id)
                            },
                            {
                                label: 'Đã chuyển hoàn',
                                key: 'returned-order',
                                icon: <DoubleLeftOutlined/>,
                                disabled: !orderUtils.canMarkAsReturned(props.item.id)
                            }
                        ],
                        onClick: _onDeliveryActionClick
                    }} placement="bottom">
                        <Button size="small" icon={<TruckOutlined/>}/>
                    </Dropdown>,
                    <Dropdown menu={{
                        items: [
                            {
                                label: 'Đẩy đơn lên Trello',
                                key: 'push-trello',
                                icon: <CloudUploadOutlined/>,
                                disabled: !orderUtils.canPushToTrello(props.item.id)
                            },
                            {
                                label: 'Danh sách băng',
                                key: 'place-items',
                                icon: <FileTextOutlined/>,
                            },
                            {
                                label: 'Sửa đơn vận chuyển',
                                key: 'delivery-bill',
                                icon: <TruckOutlined/>,
                            },
                            {
                                label: 'Mã vận đơn',
                                key: 'input-shipping-code',
                                icon: <BarcodeOutlined/>,
                                disabled: !orderUtils.isPushedTrello(props.item.id)
                            },
                            {
                                label: 'Xoá đơn hàng',
                                key: 'delete',
                                icon: <DeleteOutlined/>,
                                danger: true
                            },
                        ],
                        onClick: _onMoreActionClick
                    }} placement="bottom">
                        <Button size="small" icon={<MoreOutlined/>}/>
                    </Dropdown>
                ]
            }>
            <List.Item.Meta
                title={<Stack>
                    <Tooltip title={props.item.name}>
                        <Button onClick={() => null}
                                type="text"
                                style={{paddingLeft: 0, fontWeight: "bold"}}>
                            <Space>
                                <Typography.Text>{props.item.name}{props.item.priorityMark}{props.item.position}</Typography.Text>
                            </Space>
                        </Button>
                    </Tooltip>
                </Stack>}
                description={<Stack direction={"column"} align={"flex-start"} gap={4}>
                    <Space size={0}>
                        {_renderOrderStatus()}
                        {_renderOrderIcon()}
                        {props.item.returnReason && _renderReturnReason()}
                    </Space>
                    <Stack gap={2} direction="column" align={"flex-start"}>
                        <Space>
                            <DollarOutlined/>
                            <Space>
                                <Typography.Text>{props.item.codAmount.toLocaleString()} đ</Typography.Text>
                                {_renderCODAmount()}
                            </Space>
                        </Space>
                        {orderCustomer && <React.Fragment>
                            <CopyToClipboard text={orderCustomer.mobile}
                                             onCopy={() => message.success("Đã sao chép số điện thoại")}>
                                <Space>
                                    <PhoneOutlined/>
                                    <Typography.Paragraph ellipsis style={{
                                        width: 300,
                                        marginBottom: 0
                                    }}>{orderCustomer.mobile}</Typography.Paragraph>
                                </Space>
                            </CopyToClipboard>
                            <Tooltip title={orderCustomer.address}>
                                <Space>
                                    <EnvironmentOutlined/>
                                    <Typography.Paragraph ellipsis style={{
                                        width: 300,
                                        marginBottom: 0
                                    }}>{orderCustomer.address}</Typography.Paragraph>
                                </Space>
                            </Tooltip></React.Fragment>}
                    </Stack>
                </Stack>}/>
        </List.Item>

        <OrderChangeShippingCodeWidget
            open={toggleInputShippingCodeEditor.value}
            onClose={toggleInputShippingCodeEditor.hide}
            value={props.item.shippingCode}
            onSave={_onChangeShippingCode}/>
    </React.Fragment>
}


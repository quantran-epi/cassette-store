import {Order} from "@store/Models/Order";
import {Customer} from "@store/Models/Customer";
import React, {FunctionComponent} from "react";
import {Space} from "@components/Layout/Space";
import {EditOutlined, EnvironmentOutlined, TruckOutlined, UserOutlined} from "@ant-design/icons";
import {CustomerAddWidget} from "@modules/Customer/Screens/CustomerAdd.widget";
import {Modal} from "@components/Modal";
import {Stack} from "@components/Layout/Stack";
import {Tooltip} from "@components/Tootip";
import {Typography} from "@components/Typography";
import {CopyToClipboard} from 'react-copy-to-clipboard';
import {useMessage} from "@components/Message";
import {Button} from "@components/Button";
import { ORDER_PAYMENT_METHOD } from "@common/Constants/AppConstants";
import { Tag } from "antd";
import { Popover } from "@components/Popover";

type OrderCreateDeliveryAssistantWidgetProps = {
    open: boolean;
    onClose: () => void;
    order: Order;
    customer: Customer;
    onAddShippingCode: () => void;
}

export const OrderCreateDeliveryAssistantWidget: FunctionComponent<OrderCreateDeliveryAssistantWidgetProps> = (props) => {
    const message = useMessage();

    return <Modal open={props.open} centered title={
        <Space>
            <TruckOutlined />
            Hỗ trợ nhập đơn
        </Space>
    } destroyOnClose={true} onCancel={props.onClose} footer={<Button type={"primary"} onClick={props.onAddShippingCode}>Nhập mã vận đơn</Button>}>
        <Stack direction={"column"} align={"flex-start"}>
            <Stack direction={"row"} align={"center"}>
            <span>{props.order.paymentMethod === ORDER_PAYMENT_METHOD.BANK_TRANSFER_IN_ADVANCE && <Tag color="blue">Chuyển khoản trước</Tag>}</span>
        </Stack>
            <CopyToClipboard text={props.order.name}
                             onCopy={() => message.success("Đã sao chép Tên đơn hàng")}>
                <Typography.Text>
                    <Typography.Text strong>Tên đơn hàng: </Typography.Text>
                    <Typography.Text>{props.order.name}</Typography.Text>
                </Typography.Text>
            </CopyToClipboard>
            <CopyToClipboard text={props.customer.name}
                             onCopy={() => message.success("Đã sao chép Tên khách hàng")}>
                    <Typography.Text>
                        <Typography.Text strong>Tên khách hàng: </Typography.Text>
                        <Typography.Text>{props.customer.name}</Typography.Text>
                    </Typography.Text>
            </CopyToClipboard>
            <CopyToClipboard text={props.customer.mobile}
                             onCopy={() => message.success("Đã sao chép Số điện thoại")}>
                <Typography.Text>
                    <Typography.Text strong>Số điện thoại: </Typography.Text>
                    <Typography.Text>{props.customer.mobile}</Typography.Text>
                </Typography.Text>
            </CopyToClipboard>
            <CopyToClipboard text={props.customer.address}
                             onCopy={() => message.success("Đã sao chép Địa chỉ")}>
                <Typography.Text>
                    <Typography.Text strong>Địa chỉ: </Typography.Text>
                    <Typography.Text>{props.customer.address}</Typography.Text>
                </Typography.Text>
            </CopyToClipboard>
            <CopyToClipboard text={props.order.codAmount}
                             onCopy={() => message.success("Đã sao chép Số tiền COD")}>
                <Typography.Text>
                    <Typography.Text strong>Số tiền COD: </Typography.Text>
                    <Typography.Text>{props.order.codAmount.toLocaleString()}đ</Typography.Text>
                </Typography.Text>
            </CopyToClipboard>
            <CopyToClipboard text={"Cho xem hàng, KHÔNG DÙNG THỬ"}
                             onCopy={() => message.success("Đã sao chép Ghi chú")}>
                <Typography.Text>
                    <Typography.Text strong>Ghi chú: </Typography.Text>
                    {props.order.paymentMethod !== ORDER_PAYMENT_METHOD.BANK_TRANSFER_IN_ADVANCE && <Typography.Text>Cho xem hàng, KHÔNG DÙNG THỬ</Typography.Text>}
                </Typography.Text>
            </CopyToClipboard>
            <CopyToClipboard text={"băng cát sét"}
                             onCopy={() => message.success("Đã sao chép Mô tả hàng")}>
                <Typography.Text>
                    <Typography.Text strong>Mô tả hàng: </Typography.Text>
                    <Typography.Text>băng cát sét</Typography.Text>
                </Typography.Text>
            </CopyToClipboard>
            <CopyToClipboard text={props.order.important || "Không có thông tin quan trọng nào"}
                             onCopy={() => message.success("Đã sao chép Thông tin quan trọng")}>
                <Typography.Text>
                    <Typography.Text strong>Thông tin quan trọng: </Typography.Text>
                    <Typography.Text style={{color: "red"}}>{props.order.important || ""}</Typography.Text>
                </Typography.Text>
            </CopyToClipboard>
            <Typography.Text>
                <Typography.Text strong>Ghi chú hàng: </Typography.Text>
                    {props.order.note? <Popover content={props.order.note}>
                        <Button type={"link"}>Xem ghi chú</Button>
                    </Popover> : <Typography.Text>Không có ghi chú nào</Typography.Text>}
            </Typography.Text>
        </Stack>
    </Modal>
}
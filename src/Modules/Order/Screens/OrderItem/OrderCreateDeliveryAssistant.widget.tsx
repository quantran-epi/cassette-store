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

type OrderCreateDeliveryAssistantWidgetProps = {
    open: boolean;
    onClose: () => void;
    order: Order;
    customer: Customer;
}

export const OrderCreateDeliveryAssistantWidget: FunctionComponent<OrderCreateDeliveryAssistantWidgetProps> = (props) => {
    const message = useMessage();

    return <Modal open={props.open} centered title={
        <Space>
            <TruckOutlined />
            Hỗ trợ nhập đơn
        </Space>
    } destroyOnClose={true} onCancel={props.onClose} footer={null}>
        <Stack direction={"column"} align={"flex-start"}>
            <CopyToClipboard text={props.customer.name}
                             onCopy={() => message.success("Đã sao chép Tên khách hàng")}>
                    <Space>
                        <Typography.Text strong>Tên khách hàng:</Typography.Text>
                        <Typography.Paragraph ellipsis style={{
                            width: 300,
                            marginBottom: 0
                        }}>{props.customer.name}</Typography.Paragraph>
                    </Space>
            </CopyToClipboard>
            <CopyToClipboard text={props.customer.mobile}
                             onCopy={() => message.success("Đã sao chép Số điện thoại")}>
                <Space>
                    <Typography.Text strong>Số điện thoại:</Typography.Text>
                    <Typography.Paragraph ellipsis style={{
                        width: 300,
                        marginBottom: 0
                    }}>{props.customer.mobile}</Typography.Paragraph>
                </Space>
            </CopyToClipboard>
            <CopyToClipboard text={props.customer.address}
                             onCopy={() => message.success("Đã sao chép Địa chỉ")}>
                <Space>
                    <Typography.Text strong>Địa chỉ:</Typography.Text>
                    <Typography.Paragraph ellipsis style={{
                        width: 300,
                        marginBottom: 0
                    }}>{props.customer.address}</Typography.Paragraph>
                </Space>
            </CopyToClipboard>
            <CopyToClipboard text={props.order.codAmount}
                             onCopy={() => message.success("Đã sao chép Số tiền COD")}>
                <Space>
                    <Typography.Text strong>Số tiền COD:</Typography.Text>
                    <Typography.Paragraph ellipsis style={{
                        width: 300,
                        marginBottom: 0
                    }}>{props.order.codAmount.toLocaleString()}đ</Typography.Paragraph>
                </Space>
            </CopyToClipboard>
            <CopyToClipboard text={"Cho xem hàng, KHÔNG DÙNG THỬ"}
                             onCopy={() => message.success("Đã sao chép Ghi chú")}>
                <Space>
                    <Typography.Text strong>Ghi chú:</Typography.Text>
                    <Typography.Paragraph ellipsis style={{
                        width: 300,
                        marginBottom: 0
                    }}>Cho xem hàng, KHÔNG DÙNG THỬ</Typography.Paragraph>
                </Space>
            </CopyToClipboard>
            <CopyToClipboard text={"băng cát sét"}
                             onCopy={() => message.success("Đã sao chép Mô tả hàng")}>
                <Space>
                    <Typography.Text strong>Mô tả hàng:</Typography.Text>
                    <Typography.Paragraph ellipsis style={{
                        width: 300,
                        marginBottom: 0
                    }}>băng cát sét</Typography.Paragraph>
                </Space>
            </CopyToClipboard>
        </Stack>
    </Modal>
}
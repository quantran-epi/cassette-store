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
import {Tag} from "@components/Tag";
import {COLORS} from "@common/Constants/AppConstants";

type OrderCustomerInfoWidgetProps = {
    open: boolean;
    onClose: () => void;
    order: Order;
    customer: Customer;
}

export const OrderCustomerInfoWidget: FunctionComponent<OrderCustomerInfoWidgetProps> = (props) => {
    const message = useMessage();
    const _renderCustomerRank = () => {
        if(props.customer.isVIP) return <Tag color={COLORS.CUSTOMER.VIP}>VIP</Tag>
        else if(props.customer.isInBlacklist) return <Tag color={COLORS.CUSTOMER.BLACK_LIST}>Danh sách đen</Tag>
        else return <Tag>Thông thường</Tag>
    }

    return <Modal open={props.open} centered title={
        <Space>
            <UserOutlined />
            {props.order.name}
        </Space>
    } destroyOnClose={true} onCancel={props.onClose} footer={null}>
        <Stack direction={"column"} align={"flex-start"}>
            <CopyToClipboard text={props.order.name}
                             onCopy={() => message.success("Đã sao chép Tên đơn hàng")}>
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
            <Typography.Text>
                <Typography.Text strong>Loại khách hàng: </Typography.Text>
                <Typography.Text>{_renderCustomerRank()}</Typography.Text>
            </Typography.Text>
            <Typography.Text>
                <Typography.Text strong>Số đơn đã mua: </Typography.Text>
                <Typography.Text>{props.customer.buyCount}</Typography.Text>
            </Typography.Text>
            <Typography.Text>
                <Typography.Text strong>Số tiền đã mua: </Typography.Text>
                <Typography.Text>{props.customer.buyAmount.toLocaleString()} đ</Typography.Text>
            </Typography.Text>
            <Typography.Text>
                <Typography.Text strong>Ghi chú: </Typography.Text>
                <Typography.Text>{props.customer.note}</Typography.Text>
            </Typography.Text>
        </Stack>
    </Modal>
}
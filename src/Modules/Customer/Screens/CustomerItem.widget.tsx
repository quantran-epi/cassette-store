import {Customer} from "@store/Models/Customer";
import React from "react";
import {useToggle} from "@hooks";
import {useMessage} from "@components/Message";
import {
    CheckCircleTwoTone,
    CloseCircleTwoTone,
    DeleteOutlined,
    DropboxOutlined,
    EditOutlined, EnvironmentOutlined,
    PhoneOutlined, UserOutlined
} from "@ant-design/icons";
import {COLORS} from "@common/Constants/AppConstants";
import {Tag} from "@components/Tag";
import {List} from "@components/List";
import {Button} from "@components/Button";
import {Popconfirm} from "@components/Popconfirm";
import {Stack} from "@components/Layout/Stack";
import {Tooltip} from "@components/Tootip";
import {Space} from "@components/Layout/Space";
import {Typography} from "@components/Typography";
import {Modal} from "@components/Modal";
import {Image} from "@components/Image";
import {CustomerEditWidget} from "@modules/Customer/Screens/CustomerEdit.widget";
import {CopyToClipboard} from 'react-copy-to-clipboard';

type CustomerItemProps = {
    item: Customer;
    onDelete?: (item: Customer) => void;
    onCreateOrder?: (item: Customer) => void;
    readonly?: boolean;
}

export const CustomerItemWidget: React.FunctionComponent<CustomerItemProps> = (props) => {
    const toggleEdit = useToggle({defaultValue: false});
    const message = useMessage();

    const _onEdit = () => {
        toggleEdit.show();
    }

    const _renderCustomerIcon = () => {
        if (props.item.isInBlacklist) return <CloseCircleTwoTone twoToneColor={COLORS.CUSTOMER.BLACK_LIST}/>;
        else if (props.item.isVIP) return <Tag color={COLORS.CUSTOMER.VIP}>VIP</Tag>;
        else if (props.item.buyCount > 0) return <CheckCircleTwoTone twoToneColor={COLORS.CUSTOMER.CONFIRMED}/>;
        return undefined;
    }

    const _onCreateOrder = () => {
        if(props.onCreateOrder) props.onCreateOrder(props.item);
    }

    return <React.Fragment>
        <List.Item
            actions={
                props.readonly ? [
                    <Button onClick={_onCreateOrder} icon={<EditOutlined/>}>Tạo đơn</Button>,
                ] : [
                    <Button size="small" onClick={_onEdit} icon={<EditOutlined/>}/>,
                    <Popconfirm title="Xóa?" onConfirm={() => props.onDelete(props.item)}>
                        <Button size="small" danger icon={<DeleteOutlined/>}/>
                    </Popconfirm>
                ]
            }>
            <List.Item.Meta
                title={<Stack>
                    <Tooltip title={props.item.name}>
                        <Button onClick={() => null}
                                danger={props.item.isInBlacklist}
                                type="text"
                                style={{paddingLeft: 0, fontWeight: "bold"}}>
                            <Space>
                                <Typography.Text>{props.item.name}</Typography.Text>
                                {_renderCustomerIcon()}
                            </Space>
                        </Button>
                    </Tooltip>
                </Stack>}
                description={<Stack direction={"column"} align={"flex-start"} gap={0}>
                    <CopyToClipboard text={props.item.mobile}
                                     onCopy={() => message.success("Đã sao chép số điện thoại")}>
                        <Space>
                            <PhoneOutlined/>
                            <Typography.Paragraph ellipsis style={{
                                width: 300,
                                marginBottom: 0
                            }}>{props.item.mobile}</Typography.Paragraph>
                        </Space>
                    </CopyToClipboard>
                    {props.item.buyCount > 0 && <Space>
                        <DropboxOutlined/>
                        <Typography.Paragraph ellipsis style={{
                            width: 300,
                            marginBottom: 0
                        }}>Đã mua {props.item.buyCount} đơn hàng</Typography.Paragraph>
                    </Space>}
                    <Tooltip title={props.item.address}>
                        <Space>
                            <EnvironmentOutlined/>
                            <Typography.Paragraph ellipsis style={{
                                width: 300,
                                marginBottom: 0
                            }}>{props.item.address}</Typography.Paragraph>
                        </Space>
                    </Tooltip>
                </Stack>}/>
        </List.Item>
        <Modal open={toggleEdit.value} title={
            <Space>
                <UserOutlined/>
                Chỉnh sửa khách hàng
            </Space>
        } destroyOnClose={true} onCancel={toggleEdit.hide} footer={null}>
            <CustomerEditWidget item={props.item} onDone={() => toggleEdit.hide()}/>
        </Modal>
    </React.Fragment>
}
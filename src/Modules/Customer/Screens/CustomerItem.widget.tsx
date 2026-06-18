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
import {Space} from "@components/Layout/Space";
import {TruncatedText} from "@components/Typography";
import {Modal} from "@components/Modal";
import {CustomerEditWidget} from "@modules/Customer/Screens/CustomerEdit.widget";
import {CopyToClipboard} from 'react-copy-to-clipboard';
import {appTokens} from "../../../theme/tokens";

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
            data-testid={`customer-row-${props.item.id}`}
            actions={
                props.readonly ? [
                    <Button key="create-order" onClick={_onCreateOrder} icon={<EditOutlined/>}>Tạo đơn</Button>,
                ] : [
                    <Button key="edit" aria-label="Chỉnh sửa khách hàng" size="small" onClick={_onEdit} icon={<EditOutlined/>}/>,
                    <Popconfirm key="delete" title="Xóa?" onConfirm={() => props.onDelete(props.item)}>
                        <Button aria-label="Xóa khách hàng" size="small" danger icon={<DeleteOutlined/>}/>
                    </Popconfirm>
                ]
            }>
            <List.Item.Meta
                title={<Stack style={{minWidth: 0}} gap={appTokens.space.xs}>
                    <TruncatedText
                        text={props.item.name}
                        maxLength={28}
                        style={{
                            color: props.item.isInBlacklist ? appTokens.color.destructive : undefined,
                            fontWeight: appTokens.font.semibold,
                        }}/>
                    {_renderCustomerIcon()}
                </Stack>}
                description={<Stack direction={"column"} align={"flex-start"} gap={appTokens.space.xs} style={{minWidth: 0}}>
                    <CopyToClipboard text={props.item.mobile}
                                     onCopy={() => message.success("Đã sao chép số điện thoại")}>
                        <span>
                            <TruncatedText icon={<PhoneOutlined/>} text={props.item.mobile} maxLength={24}/>
                        </span>
                    </CopyToClipboard>
                    {props.item.buyCount > 0 && <TruncatedText
                        icon={<DropboxOutlined/>}
                        text={`Đã mua ${props.item.buyCount} đơn hàng`}
                        maxLength={30}/>}
                    <TruncatedText icon={<EnvironmentOutlined/>} text={props.item.address} maxLength={34}/>
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

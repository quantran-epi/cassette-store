import {
    UserOutlined,
    DeleteOutlined,
    EditOutlined,
    PlusOutlined,
    PhoneOutlined,
    CheckCircleTwoTone,
    CloseCircleTwoTone,
    EnvironmentOutlined,
    DropboxOutlined
} from "@ant-design/icons";
import {Button} from "@components/Button";
import {Input} from "@components/Form/Input";
import {Image} from "@components/Image";
import {Space} from "@components/Layout/Space";
import {Stack} from "@components/Layout/Stack";
import {List} from "@components/List";
import {Modal} from "@components/Modal";
import {Popconfirm} from "@components/Popconfirm";
import {Tooltip} from "@components/Tootip";
import {Typography} from "@components/Typography";
import {useScreenTitle, useToggle} from "@hooks";
import {Customer} from "@store/Models/Customer";
import {removeOrder} from "@store/Reducers/OrderReducer";
import {RootState} from "@store/Store";
import {debounce, sortBy} from "lodash";
import React, {useMemo, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import VegetablesIcon from "../../../../assets/icons/vegetable.png";
import {COLORS} from "@common/Constants/AppConstants";
import {Tag} from "@components/Tag";
import {CopyToClipboard} from 'react-copy-to-clipboard';
import {useMessage} from "@components/Message";
import {Order} from "@store/Models/Order";
import {useNavigate} from "react-router-dom";
import {RootRoutes} from "@routing/RootRoutes";

export const OrderListScreen = () => {
    const orders = useSelector((state: RootState) => state.order.orders);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const {} = useScreenTitle({value: "Đơn hàng", deps: []});
    const [searchText, setSearchText] = useState("");

    const filteredOrders = useMemo(() => {
        return sortBy(orders.filter(e => e.name.trim().toLowerCase().includes(searchText.trim().toLowerCase())), "name");
    }, [orders, searchText])

    const _onAdd = () => {
        navigate(RootRoutes.AuthorizedRoutes.OrderRoutes.Create());
    }

    const _onDelete = (item) => {
        dispatch(removeOrder([item.id]));
    }

    return <React.Fragment>
        <Stack.Compact>
            <Input allowClear placeholder="Tìm kiếm" onChange={debounce((e) => setSearchText(e.target.value), 350)}/>
            <Button onClick={_onAdd} icon={<PlusOutlined/>}/>
        </Stack.Compact>
        <List
            pagination={filteredOrders.length > 0 ? {
                position: "bottom", align: "center", pageSize: 10
            } : false}
            itemLayout="horizontal"
            dataSource={filteredOrders}
            renderItem={(item) => <Ordertem item={item} onDelete={_onDelete}/>}
        />
    </React.Fragment>
}

type OrderItemProps = {
    item: Order;
    onDelete: (item: Order) => void;
}

export const Ordertem: React.FunctionComponent<OrderItemProps> = (props) => {
    const toggleEdit = useToggle({defaultValue: false});
    const message = useMessage();

    const _onEdit = () => {
        toggleEdit.show();
    }

    const _renderOrderIcon = () => {
        // if (props.item.isInBlacklist) return <CloseCircleTwoTone twoToneColor={COLORS.CUSTOMER.BLACK_LIST}/>;
        // else if (props.item.isVIP) return <Tag color={COLORS.CUSTOMER.VIP}>VIP</Tag>;
        // else if (props.item.buyCount > 0) return <CheckCircleTwoTone twoToneColor={COLORS.CUSTOMER.CONFIRMED}/>;
        return undefined;
    }

    return <React.Fragment>
        <List.Item
            actions={
                [
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
                                type="text"
                                size={"large"}
                                style={{paddingLeft: 0, fontWeight: "bold"}}>
                            <Space>
                                <Typography.Text>{props.item.name}</Typography.Text>
                                {_renderOrderIcon()}
                            </Space>
                        </Button>
                    </Tooltip>
                </Stack>}
                description={<Stack direction={"column"} align={"flex-start"} gap={0}>
                    {/*<CopyToClipboard text={props.item.mobile}*/}
                    {/*                 onCopy={() => message.success("Đã sao chép số điện thoại")}>*/}
                    {/*    <Space onClick={_onClickMobile}>*/}
                    {/*        <PhoneOutlined/>*/}
                    {/*        <Typography.Paragraph ellipsis style={{*/}
                    {/*            width: 300,*/}
                    {/*            marginBottom: 0*/}
                    {/*        }}>{props.item.mobile}</Typography.Paragraph>*/}
                    {/*    </Space>*/}
                    {/*</CopyToClipboard>*/}
                    {/*<Tooltip title={props.item.address}>*/}
                    {/*    <Space>*/}
                    {/*        <EnvironmentOutlined/>*/}
                    {/*        <Typography.Paragraph ellipsis style={{*/}
                    {/*            width: 300,*/}
                    {/*            marginBottom: 0*/}
                    {/*        }}>{props.item.address}</Typography.Paragraph>*/}
                    {/*    </Space>*/}
                    {/*</Tooltip>*/}
                </Stack>}/>
        </List.Item>
    </React.Fragment>
}
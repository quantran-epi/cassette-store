import {
    UserOutlined,
    DeleteOutlined,
    EditOutlined,
    PlusOutlined,
    PhoneOutlined,
    CheckCircleTwoTone,
    CloseCircleTwoTone,
    EnvironmentOutlined,
    DropboxOutlined,
    DollarOutlined,
    TruckOutlined
} from "@ant-design/icons";
import { Button } from "@components/Button";
import { Input } from "@components/Form/Input";
import { Image } from "@components/Image";
import { Space } from "@components/Layout/Space";
import { Stack } from "@components/Layout/Stack";
import { List } from "@components/List";
import { Modal } from "@components/Modal";
import { Popconfirm } from "@components/Popconfirm";
import { Tooltip } from "@components/Tootip";
import { Typography } from "@components/Typography";
import { useScreenTitle, useToggle } from "@hooks";
import { Customer } from "@store/Models/Customer";
import { removeOrder } from "@store/Reducers/OrderReducer";
import { RootState } from "@store/Store";
import { debounce, sortBy } from "lodash";
import React, { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import VegetablesIcon from "../../../../assets/icons/vegetable.png";
import { COLORS, ORDER_STATUS } from "@common/Constants/AppConstants";
import { Tag } from "@components/Tag";
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useMessage } from "@components/Message";
import { Order } from "@store/Models/Order";
import { useNavigate } from "react-router-dom";
import { RootRoutes } from "@routing/RootRoutes";
import { CustomerSearchWidget } from "./OrderCreate/CustomerSearch.widget";
import { CustomerAddWidget } from "@modules/Customer/Screens/CustomerAdd.widget";

export const OrderListScreen = () => {
    const orders = useSelector((state: RootState) => state.order.orders);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const toggleAddOrderModal = useToggle();
    const toggleAddCustomerModal = useToggle();
    const { } = useScreenTitle({ value: "Đơn hàng", deps: [] });
    const [searchText, setSearchText] = useState("");
    const [prefilledCustomer, setPrefilledCustomer] = useState<Partial<Customer>>();

    const filteredOrders = useMemo(() => {
        return sortBy(orders.filter(e => e.name.trim().toLowerCase().includes(searchText.trim().toLowerCase())), "name");
    }, [orders, searchText])

    const _onAddOrder = () => {
        toggleAddOrderModal.show();
    }

    const _onDelete = (item) => {
        dispatch(removeOrder([item.id]));
    }

    const _onCreateExistedCustomer = (customer: Partial<Customer>) => {
        navigate(RootRoutes.AuthorizedRoutes.OrderRoutes.Create(), {
            state: {
                customerId: customer.id
            }
        });
    }

    const _onCreateNewCustomer = (customer: Partial<Customer>) => {
        toggleAddCustomerModal.show();
        setPrefilledCustomer(customer);
    }

    const _onCreateNewCustomerSucceed = (addedCustomer: Customer) => {
        navigate(RootRoutes.AuthorizedRoutes.OrderRoutes.Create(), {
            state: {
                customerId: addedCustomer.id
            }
        });
    }

    return <React.Fragment>
        <Stack.Compact>
            <Input allowClear placeholder="Tìm kiếm" onChange={debounce((e) => setSearchText(e.target.value), 350)} />
            <Button onClick={_onAddOrder} icon={<PlusOutlined />} />
        </Stack.Compact>
        <List
            pagination={filteredOrders.length > 0 ? {
                position: "bottom", align: "center", pageSize: 10
            } : false}
            itemLayout="horizontal"
            locale={{ emptyText: "Chưa có đơn hàng nào" }}
            dataSource={filteredOrders}
            renderItem={(item) => <Ordertem item={item} onDelete={_onDelete} />}
        />

        <Modal open={toggleAddOrderModal.value} title={
            <Space>
                <UserOutlined />
                Tạo đơn hàng mới
            </Space>
        } destroyOnClose={true} onCancel={toggleAddOrderModal.hide} footer={null}>
            <CustomerSearchWidget onCreateOrderFromExistedCustomer={_onCreateExistedCustomer}
                onCreateOrderFromNewCustomer={_onCreateNewCustomer} />
        </Modal>

        <Modal open={toggleAddCustomerModal.value} title={
            <Space>
                <UserOutlined />
                Thêm khách hàng
            </Space>
        } destroyOnClose={true} onCancel={toggleAddCustomerModal.hide} footer={null}>
            <CustomerAddWidget prefilled={prefilledCustomer} onAddSucceed={_onCreateNewCustomerSucceed} />
        </Modal>

    </React.Fragment>
}

type OrderItemProps = {
    item: Order;
    onDelete: (item: Order) => void;
}

export const Ordertem: React.FunctionComponent<OrderItemProps> = (props) => {
    const toggleEdit = useToggle({ defaultValue: false });
    const customers = useSelector((state: RootState) => state.customer.customers);
    const message = useMessage();
    const orderCustomer = useMemo(() => {
        return customers.find(e => e.id == props.item.customerId);
    }, [props.item.customerId])

    const _onEdit = () => {
        toggleEdit.show();
    }

    const _renderOrderIcon = () => {
        if (orderCustomer.isVIP) return <Tag color={COLORS.CUSTOMER.VIP}>VIP</Tag>;
        return undefined;
    }

    const _renderOrderStatus = () => {
        switch (props.item.status) {
            case ORDER_STATUS.PLACED: return <Tag>{props.item.status}</Tag>;
            case ORDER_STATUS.SHIPPED: return <Tag color={ORDER_STATUS.SHIPPED}>{props.item.status}</Tag>;
            case ORDER_STATUS.RETURNED: return <Tag color={ORDER_STATUS.RETURNED}>{props.item.status}</Tag>;
            case ORDER_STATUS.WAITING_FOR_RETURNED: return <Tag color={ORDER_STATUS.WAITING_FOR_RETURNED}>{props.item.status}</Tag>;
            default: return undefined;
        }
    }

    return <React.Fragment>
        <List.Item
            actions={
                [
                    <Button size="small" onClick={_onEdit} icon={<EditOutlined />} />,
                    <Popconfirm title="Xóa?" onConfirm={() => props.onDelete(props.item)}>
                        <Button size="small" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                ]
            }>
            <List.Item.Meta
                title={<Stack>
                    <Tooltip title={props.item.name}>
                        <Button onClick={() => null}
                            type="text"
                            size={"large"}
                            style={{ paddingLeft: 0, fontWeight: "bold" }}>
                            <Space>
                                <Typography.Text>{props.item.name}</Typography.Text>
                                {_renderOrderIcon()}
                            </Space>
                        </Button>
                    </Tooltip>
                </Stack>}
                description={<Stack direction={"column"} align={"flex-start"} gap={2}>
                    {_renderOrderStatus()}
                    <Space>
                        <DollarOutlined />
                        <Typography.Text>{props.item.codAmount.toLocaleString()} đ</Typography.Text>
                    </Space>
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
                        <Tooltip title={orderCustomer.address}>
                            <Space>
                                <EnvironmentOutlined />
                                <Typography.Paragraph ellipsis style={{
                                    width: 300,
                                    marginBottom: 0
                                }}>{orderCustomer.address}</Typography.Paragraph>
                            </Space>
                        </Tooltip></React.Fragment>}
                </Stack>} />
        </List.Item>
    </React.Fragment>
}
import {
    PlusOutlined,
    UserOutlined
} from "@ant-design/icons";
import { Button } from "@components/Button";
import { Input } from "@components/Form/Input";
import { Space } from "@components/Layout/Space";
import { Stack } from "@components/Layout/Stack";
import { List } from "@components/List";
import { Modal } from "@components/Modal";
import { useScreenTitle, useToggle, useTrello } from "@hooks";
import { CustomerAddWidget } from "@modules/Customer/Screens/CustomerAdd.widget";
import { RootRoutes } from "@routing/RootRoutes";
import { Customer } from "@store/Models/Customer";
import { removeOrder, selectSortedPendingOrders } from "@store/Reducers/OrderReducer";
import { RootState } from "@store/Store";
import { debounce, orderBy, sortBy } from "lodash";
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { CustomerSearchWidget } from "./OrderCreate/CustomerSearch.widget";
import { OrderItemWidget } from "./OrderItem/OrderItem.widget";
import { Typography } from "@components/Typography";
import { Order } from "@store/Models/Order";
import { Radio } from "@components/Form/Radio";
import {COLORS, ORDER_STATUS} from "@common/Constants/AppConstants";
import { RadioChangeEvent } from "antd";
import { Checkbox } from "@components/Form/Checkbox";
import { Checkbox as AntCheckbox } from "antd";
import { Col, Row } from "@components/Grid";
import { Divider } from "@components/Layout/Divider";
import {Tag} from "@components/Tag";

export const OrderListScreen = () => {
    const orders = useSelector((state: RootState) => state.order.orders);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const toggleAddOrderModal = useToggle();
    const toggleAddCustomerModal = useToggle();
    const { } = useScreenTitle({ value: "Đơn hàng", deps: [] });
    const [searchText, setSearchText] = useState("");
    const [searchStatuses, setSearchStatuses] = useState<string[]>([]);
    const [prefilledCustomer, setPrefilledCustomer] = useState<Partial<Customer>>();

    const filteredOrders = useMemo<Order[]>(() => {
        return orderBy(orders.filter(e => e.name.trim().toLowerCase().includes(searchText.trim().toLowerCase()) &&
            (searchStatuses.length === 0 || searchStatuses.includes(e.status))), ["createdDate"], ["desc"]);
    }, [orders, searchText, searchStatuses])

    const cassetteAmount = useMemo(() => {
        return filteredOrders.reduce((prev, cur) => prev + cur.placedItems.reduce((prev1, cur1) => prev1 + cur1.count, 0), 0);
    }, [filteredOrders])

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

    const _onChangeSearchStatuses = (checkedValue: string[]) => {
        setSearchStatuses(checkedValue);
    }

    return <React.Fragment>
        <Stack.Compact>
            <Input allowClear placeholder="Tìm kiếm" onChange={debounce((e) => setSearchText(e.target.value), 350)} />
            <Button onClick={_onAddOrder} icon={<PlusOutlined />} />
        </Stack.Compact>
        <AntCheckbox.Group
            style={{ marginTop: 7 }}
            onChange={_onChangeSearchStatuses}>
            <Row>
                <Col span={13}>
                    <Checkbox value={ORDER_STATUS.PLACED}>{ORDER_STATUS.PLACED} <Typography.Text style={{fontSize: "0.6em"}}>({orders.filter(e => e.status === ORDER_STATUS.PLACED).length})</Typography.Text></Checkbox>
                </Col>
                <Col span={11}>
                    <Checkbox value={ORDER_STATUS.CREATE_DELIVERY}>{ORDER_STATUS.CREATE_DELIVERY} <Typography.Text style={{fontSize: "0.6em"}}>({orders.filter(e => e.status === ORDER_STATUS.CREATE_DELIVERY).length})</Typography.Text></Checkbox>
                </Col>
                <Col span={13}>
                    <Checkbox value={ORDER_STATUS.SHIPPED}>{ORDER_STATUS.SHIPPED} <Typography.Text style={{fontSize: "0.6em"}}>({orders.filter(e => e.status === ORDER_STATUS.SHIPPED).length})</Typography.Text></Checkbox>
                </Col>
                <Col span={11}>
                    <Checkbox value={ORDER_STATUS.RETURNED}>{ORDER_STATUS.RETURNED} <Typography.Text style={{fontSize: "0.6em"}}>({orders.filter(e => e.status === ORDER_STATUS.RETURNED).length})</Typography.Text></Checkbox>
                </Col>
                <Col span={13}>
                    <Checkbox value={ORDER_STATUS.WAITING_FOR_RETURNED}>{ORDER_STATUS.WAITING_FOR_RETURNED} <Typography.Text style={{fontSize: "0.6em"}}>({orders.filter(e => e.status === ORDER_STATUS.WAITING_FOR_RETURNED).length})</Typography.Text></Checkbox>
                </Col>
                <Col span={11}>
                    <Checkbox value={ORDER_STATUS.NEED_RETURN}>{ORDER_STATUS.NEED_RETURN} <Typography.Text style={{fontSize: "0.6em"}}>({orders.filter(e => e.status === ORDER_STATUS.NEED_RETURN).length})</Typography.Text></Checkbox>
                </Col>
            </Row>
        </AntCheckbox.Group>
        <Divider orientation="left" style={{ marginBottom: 0 }}>Danh sách đơn hàng ({filteredOrders.length} đơn)</Divider>
        <Tag color={COLORS.ORDER_STATUS.SHIPPED}>Số băng: {cassetteAmount}</Tag>
        <List
            pagination={filteredOrders.length > 0 ? {
                position: "bottom", align: "center", pageSize: 10
            } : false}
            itemLayout="horizontal"
            locale={{ emptyText: "Chưa có đơn hàng nào" }}
            dataSource={filteredOrders}
            renderItem={(item) => <OrderItemWidget item={item} onDelete={_onDelete} />}
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

        <Modal open={toggleAddCustomerModal.value} centered title={
            <Space>
                <UserOutlined />
                Thêm khách hàng
            </Space>
        } destroyOnClose={true} onCancel={toggleAddCustomerModal.hide} footer={null}>
            <CustomerAddWidget prefilled={prefilledCustomer} onAddSucceed={_onCreateNewCustomerSucceed} />
        </Modal>

    </React.Fragment>
}
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
import {useScreenTitle, useToggle, useTrello} from "@hooks";
import { CustomerAddWidget } from "@modules/Customer/Screens/CustomerAdd.widget";
import { RootRoutes } from "@routing/RootRoutes";
import { Customer } from "@store/Models/Customer";
import { removeOrder, selectSortedPendingOrders } from "@store/Reducers/OrderReducer";
import { RootState } from "@store/Store";
import { debounce, sortBy } from "lodash";
import React, {useEffect, useMemo, useState} from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { CustomerSearchWidget } from "./OrderCreate/CustomerSearch.widget";
import { OrderItemWidget } from "./OrderItem/OrderItem.widget";
import { Typography } from "@components/Typography";

export const OrderListScreen = () => {
    const orders = useSelector((state: RootState) => state.order.orders);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const toggleAddOrderModal = useToggle();
    const toggleAddCustomerModal = useToggle();
    const { } = useScreenTitle({ value: "Đơn hàng", deps: [] });
    const [searchText, setSearchText] = useState("");
    const [prefilledCustomer, setPrefilledCustomer] = useState<Partial<Customer>>();
    const trello = useTrello();
    const sortedPendingOrders = useSelector(selectSortedPendingOrders);

    useEffect(() => {
        // trello.getCardsByList("683823d67567eff9da5c91c2").then(res => console.log(res));
        // trello.getCard("6837aba7967282e8d951f0c8");
        // trello.createComment({text: "testcomment"}, "6837aba7967282e8d951f0c8");
    }, []);

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
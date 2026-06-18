import {
    UserOutlined,
    PlusOutlined,
} from "@ant-design/icons";
import {Button} from "@components/Button";
import {Input} from "@components/Form/Input";
import {Space} from "@components/Layout/Space";
import {Stack} from "@components/Layout/Stack";
import {List} from "@components/List";
import {Modal} from "@components/Modal";
import {useScreenTitle, useToggle} from "@hooks";
import {Customer} from "@store/Models/Customer";
import {removeCustomer} from "@store/Reducers/CustomerReducer";
import {RootState} from "@store/Store";
import {debounce, sortBy} from "lodash";
import React, {useMemo, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {CustomerAddWidget} from "./CustomerAdd.widget";
import {CustomerItemWidget} from "@modules/Customer/Screens/CustomerItem.widget";
import {appTokens} from "../../../theme/tokens";

export const CustomerListScreen = () => {
    const customers = useSelector((state: RootState) => state.customer.customers);
    const toggleAddModal = useToggle({defaultValue: false});
    const dispatch = useDispatch();
    useScreenTitle({value: "Khách hàng", deps: []});
    const [searchText, setSearchText] = useState("");

    const filteredCustomers = useMemo(() => {
        return sortBy(customers.filter(e => e.address.trim().toLowerCase().includes(searchText.trim().toLowerCase()) 
        || e.name.trim().toLowerCase().includes(searchText.trim().toLowerCase())
            || e.mobile.includes(searchText.trim().toLowerCase())), "name");
    }, [customers, searchText])

    const _onAdd = () => {
        toggleAddModal.show();
    }

    const _onDelete = (item: Customer) => {
        dispatch(removeCustomer([item.id]));
    }

    return <React.Fragment>
        <Stack.Compact style={{width: "100%", marginBottom: appTokens.space.sm}}>
            <Input
                allowClear
                aria-label="Tìm kiếm khách hàng"
                placeholder="Tìm kiếm"
                onChange={debounce((e) => setSearchText(e.target.value), 350)}/>
            <Button aria-label="Thêm khách hàng" onClick={_onAdd} icon={<PlusOutlined/>}>Thêm</Button>
        </Stack.Compact>
        <List
            pagination={filteredCustomers.length > 0 ? {
                position: "bottom", align: "center", pageSize: 10
            } : false}
            itemLayout="horizontal"
            locale={{emptyText: "Chưa có khách hàng nào"}}
            dataSource={filteredCustomers}
            renderItem={(item) => <CustomerItemWidget item={item} onDelete={_onDelete}/>}
        />
        <Modal open={toggleAddModal.value} centered title={
            <Space>
                <UserOutlined />
                Thêm khách hàng
            </Space>
        } destroyOnClose={true} onCancel={toggleAddModal.hide} footer={null}>
            <CustomerAddWidget/>
        </Modal>
    </React.Fragment>
}

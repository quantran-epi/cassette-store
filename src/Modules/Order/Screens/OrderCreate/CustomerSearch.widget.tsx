import { Input } from "@components/Form/Input";
import { Button } from "@components/Button";
import { SearchOutlined } from "@ant-design/icons";
import { Stack } from "@components/Layout/Stack";
import React, { FunctionComponent, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@store/Store";
import { Customer } from "@store/Models/Customer";
import { List } from "@components/List";
import { CustomerItemWidget } from "@modules/Customer/Screens/CustomerItem.widget";
import { useToggle } from "@hooks";
import { Typography } from "@components/Typography";
import { Space } from "@components/Layout/Space";
import { useMessage } from "@components/Message";
import { Box } from "@components/Layout/Box";

type CustomerSearchWidgetProps = {
    onCreateOrderFromExistedCustomer: (customer: Partial<Customer>) => void;
    onCreateOrderFromNewCustomer: (customer: Partial<Customer>) => void;
}
export const CustomerSearchWidget: FunctionComponent<CustomerSearchWidgetProps> = (props) => {
    const customers = useSelector((state: RootState) => state.customer.customers);
    const [searchMobile, setSearchMobile] = useState<string>("");
    const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
    const toggleListCustomer = useToggle();
    const message = useMessage();

    const _onSearch = () => {
        if (Boolean(searchMobile)) {
            toggleListCustomer.show();
            setFilteredCustomers(customers.filter(e => e.mobile.includes(searchMobile.trim())));
        }
        else {
            message.error("Nhập số điện thoại")
            toggleListCustomer.hide();
            setFilteredCustomers([]);
        }
    }

    const _onCreateOrder = (customer: Partial<Customer>, isNew: boolean) => {
        _reset();
        if (isNew) props.onCreateOrderFromNewCustomer(customer);
        else props.onCreateOrderFromExistedCustomer(customer);
    }

    const _reset = () => {
        toggleListCustomer.hide();
        setFilteredCustomers([]);
        setSearchMobile("");
    }

    return <React.Fragment>
        <Stack.Compact style={{ width: "100%" }}>
            <Input autoFocus allowClear placeholder="Nhập số điện thoại" onChange={(e) => setSearchMobile(e.target.value)}
                value={searchMobile} />
            <Button onClick={_onSearch} icon={<SearchOutlined />} />
        </Stack.Compact>

        {toggleListCustomer.value && <List
            pagination={filteredCustomers.length > 0 ? {
                position: "bottom", align: "center", pageSize: 10
            } : false}
            itemLayout="horizontal"
            locale={{
                emptyText: <Stack direction={"column"} gap={0}>
                    <Typography.Text>Chưa có khách hàng này</Typography.Text>
                    <Button type={"link"} onClick={() => _onCreateOrder({ mobile: searchMobile }, true)}>Tạo đơn khách mới</Button>
                </Stack>
            }}
            dataSource={filteredCustomers}
            renderItem={(item) => <CustomerItemWidget item={item} readonly
                onCreateOrder={customer => _onCreateOrder(customer, false)} />}
        />}
    </React.Fragment>
}
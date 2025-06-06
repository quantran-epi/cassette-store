import {Input} from "@components/Form/Input";
import {Button} from "@components/Button";
import {SearchOutlined} from "@ant-design/icons";
import {Stack} from "@components/Layout/Stack";
import React, {FunctionComponent, useState} from "react";
import {useSelector} from "react-redux";
import {RootState} from "@store/Store";
import {Customer} from "@store/Models/Customer";
import {List} from "@components/List";
import {CustomerItemWidget} from "@modules/Customer/Screens/CustomerItem.widget";

type CustomerSearchWidgetProps = {
    onCreateOrderFromExistedCustomer: (customer: Customer) => void;
    onCreateOrderFromNewCustomer: (customer: Customer) => void;
}
export const CustomerSearchWidget: FunctionComponent<CustomerSearchWidgetProps> = (props) => {
    const customers = useSelector((state: RootState) => state.customer.customers);
    const [searchMobile, setSearchMobile] = useState<string>();
    const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);

    const _onSearch = () => {
        setFilteredCustomers(customers.filter(e => e.mobile.includes(searchMobile.trim())));
    }

    const _onCreateOrder = (customer: Customer, isNew: boolean) => {
        if (isNew) props.onCreateOrderFromNewCustomer(customer);
        else props.onCreateOrderFromExistedCustomer(customer);
    }

    return <React.Fragment>
        <Stack.Compact>
            <Input allowClear placeholder="sdt" onChange={(e) => setSearchMobile(e.target.value)}/>
            <Button onClick={_onSearch} icon={<SearchOutlined/>}/>
        </Stack.Compact>

        <List
            pagination={{
                position: "bottom", align: "center", pageSize: 10
            }}
            itemLayout="horizontal"
            dataSource={filteredCustomers}
            renderItem={(item) => <CustomerItemWidget item={item} readonly
                                                      onCreateOrder={customer => _onCreateOrder(customer, false)}/>}
        />
    </React.Fragment>
}
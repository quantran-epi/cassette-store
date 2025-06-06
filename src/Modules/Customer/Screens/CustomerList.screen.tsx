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
import {removeCustomer} from "@store/Reducers/CustomerReducer";
import {RootState} from "@store/Store";
import {debounce, sortBy} from "lodash";
import React, {useMemo, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import VegetablesIcon from "../../../../assets/icons/vegetable.png";
import {CustomerAddWidget} from "./CustomerAdd.widget";
import {CustomerEditWidget} from "./CustomerEdit.widget";
import {COLORS} from "@common/Constants/AppConstants";
import {Tag} from "@components/Tag";
import {useMessage} from "@components/Message";
import {CustomerItemWidget} from "@modules/Customer/Screens/CustomerItem.widget";

export const CustomerListScreen = () => {
    const customers = useSelector((state: RootState) => state.customer.customers);
    const toggleAddModal = useToggle({defaultValue: false});
    const dispatch = useDispatch();
    const {} = useScreenTitle({value: "Khách hàng", deps: []});
    const [searchText, setSearchText] = useState("");

    const filteredCustomers = useMemo(() => {
        return sortBy(customers.filter(e => e.name.trim().toLowerCase().includes(searchText.trim().toLowerCase())
            || e.mobile.includes(searchText.trim().toLowerCase())), "name");
    }, [customers, searchText])

    const _onAdd = () => {
        toggleAddModal.show();
    }

    const _onDelete = (item) => {
        dispatch(removeCustomer([item.id]));
    }

    return <React.Fragment>
        <Stack.Compact>
            <Input allowClear placeholder="Tìm kiếm" onChange={debounce((e) => setSearchText(e.target.value), 350)}/>
            <Button onClick={_onAdd} icon={<PlusOutlined/>}/>
        </Stack.Compact>
        <List
            pagination={filteredCustomers.length > 0 ? {
                position: "bottom", align: "center", pageSize: 10
            } : false}
            itemLayout="horizontal"
            dataSource={filteredCustomers}
            renderItem={(item) => <CustomerItemWidget item={item} onDelete={_onDelete}/>}
        />
        <Modal open={toggleAddModal.value} title={
            <Space>
                <UserOutlined />
                Thêm khách hàng
            </Space>
        } destroyOnClose={true} onCancel={toggleAddModal.hide} footer={null}>
            <CustomerAddWidget/>
        </Modal>
    </React.Fragment>
}


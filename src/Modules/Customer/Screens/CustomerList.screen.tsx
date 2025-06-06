import {
    DeleteOutlined,
    EditOutlined,
    PlusOutlined,
    PhoneOutlined,
    CheckCircleTwoTone,
    CloseCircleTwoTone
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

export const CustomerListScreen = () => {
    const Customers = useSelector((state: RootState) => state.customer.customers);
    const toggleAddModal = useToggle({defaultValue: false});
    const dispatch = useDispatch();
    const {} = useScreenTitle({value: "Khách hàng", deps: []});
    const [searchText, setSearchText] = useState("");

    const filteredCustomers = useMemo(() => {
        return sortBy(Customers.filter(e => e.name.trim().toLowerCase().includes(searchText.trim().toLowerCase())), "name");
    }, [Customers, searchText])

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
            pagination={{
                position: "bottom", align: "center", pageSize: 10
            }}
            itemLayout="horizontal"
            dataSource={filteredCustomers}
            renderItem={(item) => <CustomerItem item={item} onDelete={_onDelete}/>}
        />
        <Modal open={toggleAddModal.value} title={
            <Space>
                <Image src={VegetablesIcon} preview={false} width={24} style={{marginBottom: 3}}/>
                Thêm khách hàng
            </Space>
        } destroyOnClose={true} onCancel={toggleAddModal.hide} footer={null}>
            <CustomerAddWidget/>
        </Modal>
    </React.Fragment>
}

type CustomerItemProps = {
    item: Customer;
    onDelete: (item: Customer) => void;
}

export const CustomerItem: React.FunctionComponent<CustomerItemProps> = (props) => {
    const toggleEdit = useToggle({defaultValue: false});

    const _onEdit = () => {
        toggleEdit.show();
    }

    const _renderCustomerIcon = () => {
        if (props.item.isInBlacklist) return <CloseCircleTwoTone twoToneColor={"#FF0000"}/>;
        if (props.item.isVIP) return <CheckCircleTwoTone twoToneColor={"#FFD700"}/>;
        return <CheckCircleTwoTone twoToneColor={"#FFD700"}/>;
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
                                danger={props.item.isInBlacklist}
                                type="text"
                                size="small"
                                style={{paddingLeft: 0}}
                                icon={_renderCustomerIcon()}>
                            {props.item.name}
                        </Button>
                    </Tooltip>
                </Stack>}
                description={<Stack direction={"column"} align={"flex-start"} gap={0}>
                    <Tooltip title={props.item.mobile}>
                        <Button onClick={() => null}
                                type="text"
                                size="small"
                                style={{paddingLeft: 0}}
                                icon={<PhoneOutlined/>}>
                            {props.item.mobile}
                        </Button>
                    </Tooltip>
                    <Tooltip title={props.item.address}>
                        <Typography.Paragraph ellipsis style={{
                            width: 300,
                            marginBottom: 0
                        }}>{props.item.address}</Typography.Paragraph>
                    </Tooltip>
                </Stack>}/>
        </List.Item>
        <Modal open={toggleEdit.value} title={
            <Space>
                <Image src={VegetablesIcon} preview={false} width={24} style={{marginBottom: 3}}/>
                Chỉnh sửa khách hàng
            </Space>
        } destroyOnClose={true} onCancel={toggleEdit.hide} footer={null}>
            <CustomerEditWidget item={props.item} onDone={() => toggleEdit.hide()}/>
        </Modal>
    </React.Fragment>
}
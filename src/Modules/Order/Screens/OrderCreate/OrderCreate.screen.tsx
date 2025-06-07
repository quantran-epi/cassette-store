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
    SearchOutlined
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
import { addOrder, removeOrder } from "@store/Reducers/OrderReducer";
import { RootState } from "@store/Store";
import { add, debounce, sortBy } from "lodash";
import React, { FunctionComponent, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import VegetablesIcon from "../../../../../assets/icons/vegetable.png";
import { COLORS, CUSTOMER_DIFFUCULTIES, ORDER_DEFAULT_SHIPPING_COST, ORDER_PAYMENT_METHOD, ORDER_PRIORITY_STATUS, ORDER_SHIPPING_PARTNER, ORDER_STATUS } from "@common/Constants/AppConstants";
import { Tag } from "@components/Tag";
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useMessage } from "@components/Message";
import { Order } from "@store/Models/Order";
import { SmartForm, useSmartForm } from "@components/SmartForm";
import { addCustomer } from "@store/Reducers/CustomerReducer";
import { ObjectPropertyHelper } from "@common/Helpers/ObjectProperty";
import { nanoid } from "@reduxjs/toolkit";
import { CustomerSearchWidget } from "@modules/Order/Screens/OrderCreate/CustomerSearch.widget";
import { Divider } from "@components/Layout/Divider";
import { CustomerAddWidget } from "@modules/Customer/Screens/CustomerAdd.widget";
import { useLocation } from "react-router-dom";
import { Radio } from "@components/Form/Radio";
import { Form } from "@components/Form";
import { InputNumber } from "@components/Form/InputNumber";
import { OrderItem } from "@store/Models/OrderItem";

export const OrderCreateScreen = () => {
    const location = useLocation();
    const { customerId } = location.state || {};
    const orders = useSelector((state: RootState) => state.order.orders);
    const customers = useSelector((state: RootState) => state.customer.customers);
    const lastSequence = useSelector((state: RootState) => state.order.lastSequence);
    const toggleAddCustomerModal = useToggle({ defaultValue: false });
    const dispatch = useDispatch();
    const message = useMessage();
    const { } = useScreenTitle({ value: "Tạo đơn hàng", deps: [] });

    const orderCustomer = useMemo(() => {
        return customers.find(e => e.id == customerId);
    }, [customerId])

    const addOrderForm = useSmartForm<Order>({
        defaultValues: {
            id: "",
            sequence: 0,
            name: "",
            createdDate: undefined,
            placedItems: [],
            changeItems: [],
            status: ORDER_STATUS.PLACED,
            shippingCost: ORDER_DEFAULT_SHIPPING_COST,
            returnReason: "",
            isRefund: false,
            refundAmount: 0,
            paymentMethod: ORDER_PAYMENT_METHOD.CASH_COD,
            shippingPartner: ORDER_SHIPPING_PARTNER.VNPOST,
            shippingCode: "",
            codAmount: null,
            priorityMark: 0,
            priorityStatus: ORDER_PRIORITY_STATUS.NONE,
            dueDate: undefined,
            customerId: "",
        },
        onSubmit: (values) => {
            console.log(values);
            return;
            dispatch(addOrder(values.transformValues));
            message.success();
            addOrderForm.reset();
        },
        itemDefinitions: defaultValues => ({
            id: { name: ObjectPropertyHelper.nameof(defaultValues, e => e.id), noMarkup: true },
            sequence: { name: ObjectPropertyHelper.nameof(defaultValues, e => e.sequence), noMarkup: true },
            name: { label: "Tên đơn hàng", name: ObjectPropertyHelper.nameof(defaultValues, e => e.name) },
            createdDate: { name: ObjectPropertyHelper.nameof(defaultValues, e => e.createdDate), noMarkup: true },
            placedItems: { name: ObjectPropertyHelper.nameof(defaultValues, e => e.placedItems), noMarkup: true },//
            changeItems: { name: ObjectPropertyHelper.nameof(defaultValues, e => e.changeItems), noMarkup: true },
            status: { name: ObjectPropertyHelper.nameof(defaultValues, e => e.status), noMarkup: true },
            shippingCost: { label: "Phí vận chuyển", name: ObjectPropertyHelper.nameof(defaultValues, e => e.shippingCost) },
            returnReason: { name: ObjectPropertyHelper.nameof(defaultValues, e => e.returnReason), noMarkup: true },
            isRefund: { name: ObjectPropertyHelper.nameof(defaultValues, e => e.isRefund), noMarkup: true },
            refundAmount: { name: ObjectPropertyHelper.nameof(defaultValues, e => e.refundAmount), noMarkup: true },
            paymentMethod: { label: "Phương thức thanh toán", name: ObjectPropertyHelper.nameof(defaultValues, e => e.paymentMethod) },
            shippingPartner: { label: "Đơn vị vận chuyển", name: ObjectPropertyHelper.nameof(defaultValues, e => e.shippingPartner) },
            shippingCode: { label: "Mã vận đơn", name: ObjectPropertyHelper.nameof(defaultValues, e => e.shippingCode) },
            codAmount: { label: "Số tiền COD", name: ObjectPropertyHelper.nameof(defaultValues, e => e.codAmount) },
            priorityMark: { name: ObjectPropertyHelper.nameof(defaultValues, e => e.priorityMark), noMarkup: true },
            priorityStatus: { label: "Độ ưu tiên", name: ObjectPropertyHelper.nameof(defaultValues, e => e.priorityStatus) },
            dueDate: { label: "", name: ObjectPropertyHelper.nameof(defaultValues, e => e.dueDate) },//
            customerId: { name: ObjectPropertyHelper.nameof(defaultValues, e => e.customerId), noMarkup: true },
        }),
        transformFunc: (values) => ({
            ...values,
            id: values.name.concat(nanoid(10)),
            sequence: lastSequence + 1,
            createdDate: new Date()
        })
    })
    const placedItems = Form.useWatch("placedItems", addOrderForm.form);

    useEffect(() => {
        if (orderCustomer?.name) addOrderForm.form.setFieldsValue({ name: (lastSequence + 1) + "." + orderCustomer.name + "-" + orderCustomer.province });
    }, [orderCustomer])

    const _onSaveOrder = () => {
        addOrderForm.submit();
    }

    const _onDeletePlacedItem = (id: string) => {
        addOrderForm.form.setFieldsValue({ placedItems: (addOrderForm.form.getFieldValue("placedItems") as OrderItem[]).filter(e => e.id !== id) });
    }

    return <React.Fragment>
        <SmartForm {...addOrderForm.defaultProps}>
            {Boolean(orderCustomer) && <React.Fragment>
                <Divider orientation="left">Thông tin khách hàng</Divider>
                <Stack direction={"column"} align={"flex-start"}>
                    <Space>
                        <Typography.Text strong>Tên khách hàng:</Typography.Text>
                        <Typography.Text>{orderCustomer.name}</Typography.Text>
                    </Space>
                    <Space>
                        <Typography.Text strong>Số điện thoại:</Typography.Text>
                        <Typography.Text>{orderCustomer.mobile}</Typography.Text>
                    </Space>
                    <Space>
                        <Typography.Text strong>Địa chỉ:</Typography.Text>
                        <Typography.Text>{orderCustomer.address}</Typography.Text>
                    </Space>
                </Stack>
                <Divider orientation="left">Thông tin đơn hàng</Divider>
                <SmartForm.Item {...addOrderForm.itemDefinitions.name}>
                    <Input />
                </SmartForm.Item>
                <SmartForm.Item {...addOrderForm.itemDefinitions.priorityStatus}>
                    <Radio.Group
                        options={[
                            { value: ORDER_PRIORITY_STATUS.NONE, label: ORDER_PRIORITY_STATUS.NONE },
                            { value: ORDER_PRIORITY_STATUS.PRIORITY, label: ORDER_PRIORITY_STATUS.PRIORITY },
                            { value: ORDER_PRIORITY_STATUS.URGENT, label: ORDER_PRIORITY_STATUS.URGENT },
                        ]}
                    />
                </SmartForm.Item>
                <SmartForm.Item {...addOrderForm.itemDefinitions.shippingPartner}>
                    <Radio.Group
                        options={[
                            { value: ORDER_SHIPPING_PARTNER.VNPOST, label: ORDER_SHIPPING_PARTNER.VNPOST },
                            { value: ORDER_SHIPPING_PARTNER.VIETTEL_POST, label: ORDER_SHIPPING_PARTNER.VIETTEL_POST }
                        ]}
                    />
                </SmartForm.Item>
                <SmartForm.Item {...addOrderForm.itemDefinitions.paymentMethod}>
                    <Radio.Group
                        options={[
                            { value: ORDER_PAYMENT_METHOD.CASH_COD, label: ORDER_PAYMENT_METHOD.CASH_COD },
                            { value: ORDER_PAYMENT_METHOD.BANK_TRANSFER_IN_ADVANCE, label: ORDER_PAYMENT_METHOD.BANK_TRANSFER_IN_ADVANCE },
                            { value: ORDER_PAYMENT_METHOD.BANK_TRANSFER_COD, label: ORDER_PAYMENT_METHOD.BANK_TRANSFER_COD }
                        ]}
                    />
                </SmartForm.Item>
                <SmartForm.Item {...addOrderForm.itemDefinitions.codAmount}>
                    <InputNumber style={{ width: "100%" }} placeholder="Nhập số tiền COD" formatter={(value) => `đ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                </SmartForm.Item>
                <SmartForm.Item {...addOrderForm.itemDefinitions.shippingCost}>
                    <InputNumber style={{ width: "100%" }} placeholder="Nhập phí vận chuyển" formatter={(value) => `đ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                </SmartForm.Item>
                <SmartForm.Item {...addOrderForm.itemDefinitions.shippingCode}>
                    <Input placeholder="Nhập mã vận đơn" />
                </SmartForm.Item>
                <Divider orientation="left"><Space>
                    <Typography.Text>Danh sách hàng hoá</Typography.Text>
                    <Button icon={<PlusOutlined />} size="small" />
                </Space></Divider>
                <SmartForm.Item>
                    <List
                        pagination={placedItems?.length > 0 ? {
                            position: "bottom", align: "center", pageSize: 10
                        } : false}
                        itemLayout="horizontal"
                        dataSource={placedItems}
                        locale={{ emptyText: "Chưa có danh sách hàng hoá" }}
                        renderItem={(item) => <OrderPlacedItem item={item} onDelete={_onDeletePlacedItem} />}
                    />
                </SmartForm.Item>
                <SmartForm.Item>
                    <Button type="primary" fullwidth onClick={_onSaveOrder}>Lưu đơn hàng</Button>
                </SmartForm.Item>
            </React.Fragment>}
        </SmartForm>
    </React.Fragment>
}

type OrderPlacedItemProps = {
    item: OrderItem;
    onDelete: (id: string) => void;
}

const OrderPlacedItem: FunctionComponent<OrderPlacedItemProps> = (props) => {
    return null;
}
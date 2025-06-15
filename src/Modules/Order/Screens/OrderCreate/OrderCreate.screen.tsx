import {
    PlusOutlined,
    UploadOutlined
} from "@ant-design/icons";
import {
    ORDER_DEFAULT_SHIPPING_COST,
    ORDER_PAYMENT_METHOD,
    ORDER_PRIORITY_STATUS,
    ORDER_SHIPPING_PARTNER,
    ORDER_STATUS
} from "@common/Constants/AppConstants";
import {ObjectPropertyHelper} from "@common/Helpers/ObjectProperty";
import {OrderHelper} from "@common/Helpers/OrderHelper";
import {Button} from "@components/Button";
import {Form} from "@components/Form";
import {Input, TextArea} from "@components/Form/Input";
import {InputNumber} from "@components/Form/InputNumber";
import {Radio} from "@components/Form/Radio";
import {Divider} from "@components/Layout/Divider";
import {Space} from "@components/Layout/Space";
import {Stack} from "@components/Layout/Stack";
import {List} from "@components/List";
import {useMessage} from "@components/Message";
import {SmartForm, useSmartForm} from "@components/SmartForm";
import {Typography} from "@components/Typography";
import {useOrder, useScreenTitle, useToggle} from "@hooks";
import {nanoid} from "@reduxjs/toolkit";
import {RootRoutes} from "@routing/RootRoutes";
import {Order} from "@store/Models/Order";
import {OrderItem} from "@store/Models/OrderItem";
import {addOrder} from "@store/Reducers/OrderReducer";
import {RootState} from "@store/Store";
import {RadioChangeEvent} from "antd";
import React, {useEffect, useMemo, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {useLocation, useNavigate} from "react-router-dom";
import {OrderPlacedItem} from "./OrderPlacedItem.widget";
import {Upload} from "@components/Form/Upload";
import {RcFile} from "antd/es/upload";
import {Image} from "@components/Image";
import {Checkbox} from "@components/Form/Checkbox";
import {CheckboxChangeEvent} from "antd/es/checkbox";

export const OrderCreateScreen = () => {
    const location = useLocation();
    const {customerId} = location.state || {};
    const customers = useSelector((state: RootState) => state.customer.customers);
    const lastSequence = useSelector((state: RootState) => state.order.lastSequence);
    const dispatch = useDispatch();
    const message = useMessage();
    const navigate = useNavigate();
    const {} = useScreenTitle({value: "Tạo đơn hàng", deps: []});
    const orderUtils = useOrder();
    const [files, setFiles] = useState<RcFile[]>([]);
    const toggleSaveLoading = useToggle();

    const filePreviewUrls = useMemo(() => {
        if (files.length > 0) return files.map(file => URL.createObjectURL(file));
        return [];
    }, [files])

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
            paymentAmount: null,
            shippingPartner: ORDER_SHIPPING_PARTNER.VNPOST,
            shippingCode: "",
            codAmount: null,
            priorityMark: 0,
            priorityStatus: ORDER_PRIORITY_STATUS.NONE,
            dueDate: undefined,
            customerId: "",
            trelloCardId: null,
            position: null,
            note: "",
            isFreeShip: false
        },
        onSubmit: (values) => {
            // console.log(values.transformValues);
            toggleSaveLoading.show();
            orderUtils.createOrder(values.transformValues, orderCustomer, files).then(newOrder => {
                if (newOrder !== null) {
                    message.success("Tạo đơn hàng thành công");
                    addOrderForm.reset();
                    navigate(RootRoutes.AuthorizedRoutes.OrderRoutes.List());
                } else message.error("Tạo đơn hàng lỗi");
                toggleSaveLoading.hide();
            });
        },
        itemDefinitions: defaultValues => ({
            id: {name: ObjectPropertyHelper.nameof(defaultValues, e => e.id), noMarkup: true},
            sequence: {name: ObjectPropertyHelper.nameof(defaultValues, e => e.sequence), noMarkup: true},
            name: {name: ObjectPropertyHelper.nameof(defaultValues, e => e.name)},
            createdDate: {name: ObjectPropertyHelper.nameof(defaultValues, e => e.createdDate), noMarkup: true},
            placedItems: {name: ObjectPropertyHelper.nameof(defaultValues, e => e.placedItems), noMarkup: true},
            changeItems: {name: ObjectPropertyHelper.nameof(defaultValues, e => e.changeItems), noMarkup: true},
            status: {name: ObjectPropertyHelper.nameof(defaultValues, e => e.status), noMarkup: true},
            shippingCost: {
                label: "Phí vận chuyển",
                name: ObjectPropertyHelper.nameof(defaultValues, e => e.shippingCost)
            },
            returnReason: {name: ObjectPropertyHelper.nameof(defaultValues, e => e.returnReason), noMarkup: true},
            isRefund: {name: ObjectPropertyHelper.nameof(defaultValues, e => e.isRefund), noMarkup: true},
            refundAmount: {name: ObjectPropertyHelper.nameof(defaultValues, e => e.refundAmount), noMarkup: true},
            paymentMethod: {
                label: "Phương thức thanh toán",
                name: ObjectPropertyHelper.nameof(defaultValues, e => e.paymentMethod)
            },
            paymentAmount: {
                label: "Số tiền thu khách hàng",
                name: ObjectPropertyHelper.nameof(defaultValues, e => e.paymentAmount)
            },
            shippingPartner: {
                label: "Đơn vị vận chuyển",
                name: ObjectPropertyHelper.nameof(defaultValues, e => e.shippingPartner)
            },
            shippingCode: {label: "Mã vận đơn", name: ObjectPropertyHelper.nameof(defaultValues, e => e.shippingCode)},
            codAmount: {label: "Số tiền COD", name: ObjectPropertyHelper.nameof(defaultValues, e => e.codAmount)},
            priorityMark: {name: ObjectPropertyHelper.nameof(defaultValues, e => e.priorityMark), noMarkup: true},
            priorityStatus: {
                name: ObjectPropertyHelper.nameof(defaultValues, e => e.priorityStatus)
            },
            dueDate: {label: "", name: ObjectPropertyHelper.nameof(defaultValues, e => e.dueDate)},
            customerId: {name: ObjectPropertyHelper.nameof(defaultValues, e => e.customerId), noMarkup: true},
            trelloCardId: {name: ObjectPropertyHelper.nameof(defaultValues, e => e.trelloCardId), noMarkup: true},
            position: {name: ObjectPropertyHelper.nameof(defaultValues, e => e.position), noMarkup: true},
            note: {label: "Ghi chú thông tin hàng", name: ObjectPropertyHelper.nameof(defaultValues, e => e.note)},
            isFreeShip: {name: ObjectPropertyHelper.nameof(defaultValues, e => e.isFreeShip), valuePropName: "checked"},
        }),
        transformFunc: (values) => ({
            ...values,
            id: values.name.concat(nanoid(10)),
            sequence: lastSequence + 1,
            createdDate: (new Date()).toISOString()
        })
    })
    const placedItems = Form.useWatch("placedItems", addOrderForm.form);

    useEffect(() => {
        if (orderCustomer?.name) {
            let _placedItems = placedItems?.length > 0 ? placedItems : [OrderHelper.createNewEmptyOrderItem(addOrderForm.form.getFieldValue("name"), true)]
            addOrderForm.form.setFieldsValue({
                name: (lastSequence + 1) + ". " + orderCustomer.name + "-" + orderCustomer.province,
                customerId: orderCustomer.id,
                placedItems: _placedItems
            });
            addOrderForm.form.setFieldsValue({
                paymentAmount: orderUtils.calculateOrderPaymentAmount(_placedItems, orderCustomer.id),
                codAmount: orderUtils.getAutoCODAmount(addOrderForm.form.getFieldValue("paymentMethod"), orderUtils.calculateOrderPaymentAmount(_placedItems, orderCustomer.id))
            });
        }
    }, [orderCustomer])

    const _onSaveOrder = () => {
        addOrderForm.submit();
    }

    const _onUpdatePlacedItems = (placedItems: OrderItem[]) => {
        let newPaymentAmount = orderUtils.calculateOrderPaymentAmount(placedItems, addOrderForm.form.getFieldValue("customerId"), addOrderForm.form.getFieldValue("isFreeShip"))
        addOrderForm.form.setFieldsValue({
            placedItems: placedItems,
            paymentAmount: newPaymentAmount,
            codAmount: orderUtils.getAutoCODAmount(addOrderForm.form.getFieldValue("paymentMethod"), newPaymentAmount)
        });
    }

    const _onDeletePlacedItem = (id: string) => {
        let updatedPlacedItems = (addOrderForm.form.getFieldValue("placedItems") as OrderItem[]).filter(e => e.id !== id);
        _onUpdatePlacedItems(updatedPlacedItems);
    }

    const _onAddPlaceItems = () => {
        let newOrder = OrderHelper.createNewEmptyOrderItem(addOrderForm.form.getFieldValue("name"), placedItems.length == 0 ? true : false);
        _onUpdatePlacedItems([...addOrderForm.form.getFieldValue("placedItems"), newOrder]);
    }

    const _onChangePlacedItem = (placedItem: OrderItem) => {
        let updatedOrderItems = (addOrderForm.form.getFieldValue("placedItems") as OrderItem[]).map(e => {
            if (e.id == placedItem.id) return placedItem;
            return e;
        });
        _onUpdatePlacedItems(updatedOrderItems);
    }

    const _onChangePaymentMethod = (e: RadioChangeEvent) => {
        let formValues = addOrderForm.form.getFieldsValue();
        addOrderForm.form.setFieldsValue({codAmount: orderUtils.getAutoCODAmount(e.target.value, formValues.paymentAmount)});
    }

    const _onChangeIsFreeShip = (e: CheckboxChangeEvent) => {
        let newPaymentAmount = orderUtils.calculateOrderPaymentAmount(addOrderForm.form.getFieldValue("placedItems"),
            addOrderForm.form.getFieldValue("customerId"), e.target.checked);
        addOrderForm.form.setFieldsValue({
            paymentAmount: newPaymentAmount,
            codAmount: orderUtils.getAutoCODAmount(addOrderForm.form.getFieldValue("paymentMethod"), newPaymentAmount)
        })
    }

    const _onBeforeUpload = (file: RcFile, fileList: RcFile[]) => {
        setFiles(fileList);
        return false;
    }

    const _renderPreviewUploadFiles = () => {
        return filePreviewUrls.length > 0 ? <Stack fullwidth={true} gap={5}>
            {filePreviewUrls.map(e => <Image width={100} height={100} preview src={e}/>)}
        </Stack> : <Typography.Text type={"secondary"}>Chưa có ảnh đính kèm</Typography.Text>
    }

    return <React.Fragment>
        <SmartForm {...addOrderForm.defaultProps}>
            {Boolean(orderCustomer) && <React.Fragment>
                <Divider orientation="left">Thông tin khách hàng</Divider>
                <Stack direction={"column"} align={"flex-start"} gap={3}>
                    <Typography.Text>
                        <Typography.Text strong style={{marginRight: 5}}>Tên khách hàng:</Typography.Text>
                        <Typography.Text>{orderCustomer.name}</Typography.Text>
                    </Typography.Text>
                    <Typography.Text>
                        <Typography.Text strong style={{marginRight: 5}}>Số điện thoại:</Typography.Text>
                        <Typography.Text>{orderCustomer.mobile}</Typography.Text>
                    </Typography.Text>
                    <Typography.Text>
                        <Typography.Text strong style={{marginRight: 5}}>Địa chỉ:</Typography.Text>
                        <Typography.Text>{orderCustomer.address}</Typography.Text>
                    </Typography.Text>
                </Stack>
                <Divider orientation="left">Tên đơn hàng</Divider>
                <SmartForm.Item {...addOrderForm.itemDefinitions.name}>
                    <Input/>
                </SmartForm.Item>
                <SmartForm.Item {...addOrderForm.itemDefinitions.priorityStatus}>
                    <Radio.Group
                        options={[
                            {value: ORDER_PRIORITY_STATUS.NONE, label: ORDER_PRIORITY_STATUS.NONE},
                            {value: ORDER_PRIORITY_STATUS.PRIORITY, label: ORDER_PRIORITY_STATUS.PRIORITY},
                            {value: ORDER_PRIORITY_STATUS.URGENT, label: ORDER_PRIORITY_STATUS.URGENT},
                        ]}
                    />
                </SmartForm.Item>
                <Divider orientation="left"><Space>
                    <Typography.Text>Danh sách hàng hoá</Typography.Text>
                    <Button icon={<PlusOutlined/>} size="small" onClick={_onAddPlaceItems}/>
                </Space></Divider>
                <List
                    pagination={false}
                    itemLayout="horizontal"
                    dataSource={placedItems}
                    locale={{emptyText: "Chưa có danh sách hàng hoá"}}
                    renderItem={(item) => <OrderPlacedItem item={item} onDelete={_onDeletePlacedItem}
                                                           onChange={_onChangePlacedItem}
                                                           allPlacedItems={placedItems}/>}
                />
                <SmartForm.Item {...addOrderForm.itemDefinitions.paymentAmount}>
                    <InputNumber style={{width: "100%"}} placeholder="Nhập số tiền thu"
                                 formatter={(value) => `đ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}/>
                </SmartForm.Item>
                <SmartForm.Item {...addOrderForm.itemDefinitions.note}>
                    <TextArea rows={3} placeholder="Nhập ghi chú"/>
                </SmartForm.Item>
                <Divider orientation="left"><Space>
                    <Typography.Text>Ảnh đính kèm</Typography.Text>
                    <Upload showUploadList={false} beforeUpload={_onBeforeUpload} multiple={true}
                            style={{marginBottom: 5}}>
                        <Button icon={<UploadOutlined/>} size="small"/>
                    </Upload>
                </Space></Divider>
                <SmartForm.Item>
                    {_renderPreviewUploadFiles()}
                </SmartForm.Item>
                <Divider orientation="left">Thông tin vận chuyển</Divider>
                <SmartForm.Item {...addOrderForm.itemDefinitions.isFreeShip}>
                    <Checkbox onChange={_onChangeIsFreeShip}>Miễn phí vận chuyển</Checkbox>
                </SmartForm.Item>
                <SmartForm.Item {...addOrderForm.itemDefinitions.shippingPartner}>
                    <Radio.Group
                        options={[
                            {value: ORDER_SHIPPING_PARTNER.VNPOST, label: ORDER_SHIPPING_PARTNER.VNPOST},
                            {value: ORDER_SHIPPING_PARTNER.VIETTEL_POST, label: ORDER_SHIPPING_PARTNER.VIETTEL_POST}
                        ]}
                    />
                </SmartForm.Item>
                <SmartForm.Item {...addOrderForm.itemDefinitions.paymentMethod}>
                    <Radio.Group
                        onChange={_onChangePaymentMethod}
                        options={[
                            {value: ORDER_PAYMENT_METHOD.CASH_COD, label: ORDER_PAYMENT_METHOD.CASH_COD},
                            {
                                value: ORDER_PAYMENT_METHOD.BANK_TRANSFER_IN_ADVANCE,
                                label: ORDER_PAYMENT_METHOD.BANK_TRANSFER_IN_ADVANCE
                            },
                        ]}
                    />
                </SmartForm.Item>
                <SmartForm.Item {...addOrderForm.itemDefinitions.codAmount}>
                    <InputNumber style={{width: "100%"}} placeholder="Nhập số tiền COD"
                                 formatter={(value) => `đ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}/>
                </SmartForm.Item>
                <SmartForm.Item {...addOrderForm.itemDefinitions.shippingCost}>
                    <InputNumber style={{width: "100%"}} placeholder="Nhập phí vận chuyển"
                                 formatter={(value) => `đ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}/>
                </SmartForm.Item>
                <SmartForm.Item>
                    <Button type="primary" fullwidth onClick={_onSaveOrder} loading={toggleSaveLoading.value}>Lưu đơn
                        hàng</Button>
                </SmartForm.Item>
                <br/>
            </React.Fragment>}
        </SmartForm>
    </React.Fragment>
}

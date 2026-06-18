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
import {DatePicker} from "@components/Form/DatePicker";
import {Radio} from "@components/Form/Radio";
import {Divider} from "@components/Layout/Divider";
import {Space} from "@components/Layout/Space";
import {Stack} from "@components/Layout/Stack";
import {List} from "@components/List";
import {useMessage} from "@components/Message";
import {SmartForm, useSmartForm} from "@components/SmartForm";
import {Typography} from "@components/Typography";
import {getOrderWorkflowMessage, hasOrderWorkflowSyncFailures, useOrder, useScreenTitle, useToggle} from "@hooks";
import {nanoid} from "@reduxjs/toolkit";
import {RootRoutes} from "@routing/RootRoutes";
import {Order} from "@store/Models/Order";
import {OrderItem} from "@store/Models/OrderItem";
import {Customer} from "@store/Models/Customer";
import {RootState} from "@store/Store";
import {RadioChangeEvent} from "antd";
import React, {useEffect, useMemo, useState} from "react";
import {useSelector} from "react-redux";
import {useLocation, useNavigate} from "react-router-dom";
import {OrderPlacedItem} from "./OrderPlacedItem.widget";
import {Upload} from "@components/Form/Upload";
import {RcFile} from "antd/es/upload";
import {Image} from "@components/Image";
import {Checkbox} from "@components/Form/Checkbox";
import {CheckboxChangeEvent} from "antd/es/checkbox";
import {CustomerSearchWidget} from "./CustomerSearch.widget";
import {CustomerAddWidget} from "@modules/Customer/Screens/CustomerAdd.widget";
import {OrderSelectedCustomerSummaryWidget} from "./OrderSelectedCustomerSummary.widget";
import {Collapse} from "@components/Collapse/Collapse";
import {OrderCreateDetailsSummaryWidget} from "./OrderCreateDetailsSummary.widget";
import {appTokens} from "../../../../theme/tokens";

type CreateFlowMode = "lookup" | "add" | "form";

export const OrderCreateScreen = () => {
    const location = useLocation();
    const {customerId} = location.state || {};
    const customers = useSelector((state: RootState) => state.customer.customers);
    const lastSequence = useSelector((state: RootState) => state.order.lastSequence);
    const message = useMessage();
    const navigate = useNavigate();
    useScreenTitle({value: "Tạo đơn hàng", deps: []});
    const orderUtils = useOrder();
    const [files, setFiles] = useState<RcFile[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer>();
    const [prefilledCustomer, setPrefilledCustomer] = useState<Partial<Customer>>();
    const [createFlowMode, setCreateFlowMode] = useState<CreateFlowMode>("lookup");
    const toggleSaveLoading = useToggle();

    const filePreviewUrls = useMemo(() => {
        if (files.length > 0) return files.map(file => URL.createObjectURL(file));
        return [];
    }, [files])

    useEffect(() => {
        return () => filePreviewUrls.forEach(url => URL.revokeObjectURL(url));
    }, [filePreviewUrls])

    const routeStateCustomer = useMemo(() => {
        return customers.find(e => e.id == customerId);
    }, [customers, customerId])

    const orderCustomer = selectedCustomer;

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
            isFreeShip: false,
            isPayCOD: false,
            important: ""
        },
        onSubmit: (values) => {
            // console.log(values.transformValues);
            toggleSaveLoading.show();
            orderUtils.createOrder(values.transformValues, orderCustomer, files).then(result => {
                if (result.localUpdated) {
                    if (hasOrderWorkflowSyncFailures(result)) message.warning(getOrderWorkflowMessage(result));
                    else message.success("Tạo đơn hàng thành công");
                    addOrderForm.reset();
                    navigate(RootRoutes.AuthorizedRoutes.OrderRoutes.List());
                } else message.error(getOrderWorkflowMessage(result));
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
            dueDate: {
                label: "Ngày hẹn",
                name: ObjectPropertyHelper.nameof(defaultValues, e => e.dueDate),
                normalize: value => value?.toDate?.() || value
            },
            customerId: {name: ObjectPropertyHelper.nameof(defaultValues, e => e.customerId), noMarkup: true},
            trelloCardId: {name: ObjectPropertyHelper.nameof(defaultValues, e => e.trelloCardId), noMarkup: true},
            position: {name: ObjectPropertyHelper.nameof(defaultValues, e => e.position), noMarkup: true},
            isPayCOD: {name: ObjectPropertyHelper.nameof(defaultValues, e => e.isPayCOD), noMarkup: true},
            note: {label: "Ghi chú thông tin hàng", name: ObjectPropertyHelper.nameof(defaultValues, e => e.note)},
            isFreeShip: {name: ObjectPropertyHelper.nameof(defaultValues, e => e.isFreeShip), valuePropName: "checked"},
            important: {label: "Thông tin quan trọng", name: ObjectPropertyHelper.nameof(defaultValues, e => e.important)},
        }),
        transformFunc: (values) => ({
            ...values,
            id: (values.name || "").concat(nanoid(10)),
            sequence: lastSequence + 1,
            createdDate: (new Date()).toISOString()
        })
    })
    const placedItems = Form.useWatch("placedItems", addOrderForm.form);
    const detailsSummaryValues = {
        priorityStatus: Form.useWatch("priorityStatus", addOrderForm.form),
        isFreeShip: Form.useWatch("isFreeShip", addOrderForm.form),
        shippingPartner: Form.useWatch("shippingPartner", addOrderForm.form),
        paymentMethod: Form.useWatch("paymentMethod", addOrderForm.form),
        paymentAmount: Form.useWatch("paymentAmount", addOrderForm.form),
        codAmount: Form.useWatch("codAmount", addOrderForm.form),
        shippingCost: Form.useWatch("shippingCost", addOrderForm.form),
        dueDate: Form.useWatch("dueDate", addOrderForm.form),
        important: Form.useWatch("important", addOrderForm.form),
    };

    useEffect(() => {
        if (routeStateCustomer) {
            setSelectedCustomer(routeStateCustomer);
            setCreateFlowMode("form");
        }
    }, [routeStateCustomer])

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

    const _onSelectCustomer = (customer: Partial<Customer>) => {
        const existingCustomer = customers.find(item => item.id === customer.id) || customer as Customer;
        setSelectedCustomer(existingCustomer);
        setPrefilledCustomer(undefined);
        setCreateFlowMode("form");
    }

    const _onStartAddCustomer = (customer: Partial<Customer>) => {
        setPrefilledCustomer(customer);
        setCreateFlowMode("add");
    }

    const _onAddCustomerSucceed = (customer: Customer) => {
        setSelectedCustomer(customer);
        setPrefilledCustomer(undefined);
        setCreateFlowMode("form");
    }

    const _onChangeCustomer = () => {
        setSelectedCustomer(undefined);
        setPrefilledCustomer(undefined);
        setCreateFlowMode("lookup");
    }

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

    const _onChangePaymentAmount = (value: number) => {
        addOrderForm.form.setFieldsValue({codAmount: value});
    }

    const _onBeforeUpload = (file: RcFile, fileList: RcFile[]) => {
        setFiles(fileList);
        return false;
    }

    const _sectionDividerStyle = (): React.CSSProperties => ({
        margin: `${appTokens.space.sm}px 0 ${appTokens.space.xs}px`
    });

    const _renderPreviewUploadFiles = () => {
        return filePreviewUrls.length > 0 ? <Stack fullwidth={true} gap={appTokens.space.sm} wrap="wrap">
            {filePreviewUrls.map(e => <Image key={e} width={72} height={72} preview src={e}/>)}
        </Stack> : <Typography.Text type={"secondary"}>Chưa có ảnh đính kèm</Typography.Text>
    }

    return <React.Fragment>
        {!orderCustomer && createFlowMode === "lookup" && <CustomerSearchWidget
            onCreateOrderFromExistedCustomer={_onSelectCustomer}
            onCreateOrderFromNewCustomer={_onStartAddCustomer}/>
        }
        {!orderCustomer && createFlowMode === "add" && <CustomerAddWidget
            prefilled={prefilledCustomer}
            onAddSucceed={_onAddCustomerSucceed}/>
        }
        {Boolean(orderCustomer) && <SmartForm {...addOrderForm.defaultProps}>
            <Stack direction="column" align="stretch" gap={appTokens.space.sm} fullwidth>
                <OrderSelectedCustomerSummaryWidget customer={orderCustomer} onChangeCustomer={_onChangeCustomer}/>
                <Divider orientation="left" style={_sectionDividerStyle()}>Tên đơn hàng</Divider>
                <SmartForm.Item {...addOrderForm.itemDefinitions.name}>
                    <Input/>
                </SmartForm.Item>
                <Divider orientation="left" style={_sectionDividerStyle()}><Space>
                    <Typography.Text>Danh sách hàng hoá</Typography.Text>
                    <Button aria-label="Thêm hàng hoá" icon={<PlusOutlined/>} size="small" onClick={_onAddPlaceItems}/>
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
                    <InputNumber onChange={_onChangePaymentAmount} style={{width: "100%"}} placeholder="Nhập số tiền thu"
                                 formatter={(value) => `đ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}/>
                </SmartForm.Item>
                <SmartForm.Item {...addOrderForm.itemDefinitions.note}>
                    <TextArea rows={3} placeholder="Nhập ghi chú"/>
                </SmartForm.Item>
                <Divider orientation="left" style={_sectionDividerStyle()}><Space>
                    <Typography.Text>Ảnh đính kèm</Typography.Text>
                    <Upload showUploadList={false} beforeUpload={_onBeforeUpload} multiple={true}
                            style={{marginBottom: appTokens.space.xs}}>
                        <Button aria-label="Thêm ảnh" icon={<UploadOutlined/>} size="small">Thêm ảnh</Button>
                    </Upload>
                </Space></Divider>
                <SmartForm.Item>
                    {_renderPreviewUploadFiles()}
                </SmartForm.Item>
                <Collapse size="small" items={[{
                    key: "details",
                    forceRender: true,
                    label: <Space wrap>
                        <Typography.Text>Thông tin thêm</Typography.Text>
                        <OrderCreateDetailsSummaryWidget values={detailsSummaryValues}/>
                    </Space>,
                    children: <Stack direction="column" align="stretch" gap={appTokens.space.xs} fullwidth>
                        <SmartForm.Item {...addOrderForm.itemDefinitions.priorityStatus}>
                            <Radio.Group
                                options={[
                                    {value: ORDER_PRIORITY_STATUS.NONE, label: ORDER_PRIORITY_STATUS.NONE},
                                    {value: ORDER_PRIORITY_STATUS.PRIORITY, label: ORDER_PRIORITY_STATUS.PRIORITY},
                                    {value: ORDER_PRIORITY_STATUS.URGENT, label: ORDER_PRIORITY_STATUS.URGENT},
                                ]}
                            />
                        </SmartForm.Item>
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
                        <SmartForm.Item {...addOrderForm.itemDefinitions.dueDate}>
                            <DatePicker style={{width: "100%"}}/>
                        </SmartForm.Item>
                        <SmartForm.Item {...addOrderForm.itemDefinitions.important}>
                            <Input placeholder="Nhập note quan trọng"/>
                        </SmartForm.Item>
                    </Stack>
                }]}/>
                <SmartForm.Item>
                    <Button type="primary" fullwidth onClick={_onSaveOrder} loading={toggleSaveLoading.value} style={{minHeight: appTokens.control.height}}>Lưu đơn
                        hàng</Button>
                </SmartForm.Item>
            </Stack>
        </SmartForm>}
    </React.Fragment>
}

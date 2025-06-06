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
import {addOrder, removeOrder} from "@store/Reducers/OrderReducer";
import {RootState} from "@store/Store";
import {debounce, sortBy} from "lodash";
import React, {useMemo, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import VegetablesIcon from "../../../../../assets/icons/vegetable.png";
import {COLORS, CUSTOMER_DIFFUCULTIES, ORDER_STATUS} from "@common/Constants/AppConstants";
import {Tag} from "@components/Tag";
import {CopyToClipboard} from 'react-copy-to-clipboard';
import {useMessage} from "@components/Message";
import {Order} from "@store/Models/Order";
import {SmartForm, useSmartForm} from "@components/SmartForm";
import {addCustomer} from "@store/Reducers/CustomerReducer";
import {ObjectPropertyHelper} from "@common/Helpers/ObjectProperty";
import {nanoid} from "@reduxjs/toolkit";
import {CustomerSearchWidget} from "@modules/Order/Screens/OrderCreate/CustomerSearch.widget";

export const OrderCreateScreen = () => {
    const orders = useSelector((state: RootState) => state.order.orders);
    const toggleAddModal = useToggle({defaultValue: false});
    const dispatch = useDispatch();
    const message = useMessage();
    const {} = useScreenTitle({value: "Tạo đơn hàng", deps: []});
    const [searchMobile, setSearchMobile] = useState<string>();

    const addOrderForm = useSmartForm<Order>({
        defaultValues: {
            id: "",
            name: "",
            createdDate: undefined,
            placedItems: [],
            changeItems: [],
            status: ORDER_STATUS.PLACED,
            shippingCost: 0,
            returnReason: "",
            isRefund: false,
            refundAmount: 0,
            paymentMethod: "",
            shippingPartner: "",
            shippingCode: "",
            codAmount: 0,
            priorityMark: 0,
            isPriority: false,
            isUrgent: false,
            dueDate: undefined,
            customerId: "",
        },
        onSubmit: (values) => {
            dispatch(addOrder(values.transformValues));
            message.success();
            addOrderForm.reset();
        },
        itemDefinitions: defaultValues => ({
            id: {name: ObjectPropertyHelper.nameof(defaultValues, e => e.id), noMarkup: true},
            name: {name: ObjectPropertyHelper.nameof(defaultValues, e => e.name)},
            createdDate: {name: ObjectPropertyHelper.nameof(defaultValues, e => e.name), noMarkup: true},
            placedItems: {name: ObjectPropertyHelper.nameof(defaultValues, e => e.name), noMarkup: true},
            changeItems: {name: ObjectPropertyHelper.nameof(defaultValues, e => e.name), noMarkup: true},
            status: {name: ObjectPropertyHelper.nameof(defaultValues, e => e.name), noMarkup: true},
            shippingCost: {name: ObjectPropertyHelper.nameof(defaultValues, e => e.name)},
            returnReason: {name: ObjectPropertyHelper.nameof(defaultValues, e => e.name), noMarkup: true},
            isRefund: {name: ObjectPropertyHelper.nameof(defaultValues, e => e.name), noMarkup: true},
            refundAmount: {name: ObjectPropertyHelper.nameof(defaultValues, e => e.name), noMarkup: true},
            paymentMethod: {name: ObjectPropertyHelper.nameof(defaultValues, e => e.name)},
            shippingPartner: {name: ObjectPropertyHelper.nameof(defaultValues, e => e.name)},
            shippingCode: {name: ObjectPropertyHelper.nameof(defaultValues, e => e.name)},
            codAmount: {name: ObjectPropertyHelper.nameof(defaultValues, e => e.name)},
            priorityMark: {name: ObjectPropertyHelper.nameof(defaultValues, e => e.name), noMarkup: true},
            isPriority: {name: ObjectPropertyHelper.nameof(defaultValues, e => e.name)},
            isUrgent: {name: ObjectPropertyHelper.nameof(defaultValues, e => e.name)},
            dueDate: {name: ObjectPropertyHelper.nameof(defaultValues, e => e.name)},
            customerId: {name: ObjectPropertyHelper.nameof(defaultValues, e => e.name), noMarkup: true},
        }),
        transformFunc: (values) => ({
            ...values,
            id: values.name.concat(nanoid(10)),
            createdDate: new Date()
        })
    })

    const _onCreateExistedCustomer = (customer: Customer) => {

    }

    const _onCreateNewCustomer = (customer: Customer) => {

    }

    return <React.Fragment>
        <CustomerSearchWidget onCreateOrderFromExistedCustomer={_onCreateExistedCustomer} onCreateOrderFromNewCustomer={_onCreateNewCustomer} />

        <SmartForm {...addOrderForm.defaultProps}>

        </SmartForm>
    </React.Fragment>
}

import {ObjectPropertyHelper} from "@common/Helpers/ObjectProperty"
import {Button} from "@components/Button"
import {Input, TextArea} from "@components/Form/Input"
import {Stack} from "@components/Layout/Stack"
import {useMessage} from "@components/Message"
import {SmartForm, useSmartForm} from "@components/SmartForm"
import {nanoid} from "@reduxjs/toolkit"
import {Customer} from "@store/Models/Customer"
import {addCustomer} from "@store/Reducers/CustomerReducer"
import {useDispatch} from "react-redux"
import {Option, Select} from "@components/Form/Select";
import {CUSTOMER_DIFFUCULTIES, CUSTOMER_PROVINCES} from "@common/Constants/AppConstants";
import {Tag} from "@components/Tag";
import {Form} from "@components/Form";
import {AreaHelpers} from "@common/Helpers/AreaHelper";

export const CustomerAddWidget = () => {
    const dispatch = useDispatch();
    const message = useMessage();

    const addCustomerForm = useSmartForm<Customer>({
        defaultValues: {
            id: "",
            name: "",
            address: "",
            area: "",
            province: null,
            difficulty: CUSTOMER_DIFFUCULTIES[1],
            isInBlacklist: false,
            isVIP: false,
            mobile: "",
            buyCount: 0,
            note: ""
        },
        onSubmit: (values) => {
            dispatch(addCustomer(values.transformValues));
            message.success();
            addCustomerForm.reset();
        },
        itemDefinitions: defaultValues => ({
            id: {name: ObjectPropertyHelper.nameof(defaultValues, e => e.id), noMarkup: true},
            area: {name: ObjectPropertyHelper.nameof(defaultValues, e => e.area), noMarkup: true},
            name: {label: "Tên khách hàng", name: ObjectPropertyHelper.nameof(defaultValues, e => e.name)},
            address: {label: "Địa chỉ", name: ObjectPropertyHelper.nameof(defaultValues, e => e.address)},
            province: {label: "Tỉnh thành", name: ObjectPropertyHelper.nameof(defaultValues, e => e.province)},
            difficulty: {label: "Độ khó", name: ObjectPropertyHelper.nameof(defaultValues, e => e.difficulty)},
            isInBlacklist: {name: ObjectPropertyHelper.nameof(defaultValues, e => e.isInBlacklist), noMarkup: true},
            isVIP: {name: ObjectPropertyHelper.nameof(defaultValues, e => e.isVIP), noMarkup: true},
            mobile: {label: "Điện thoại", name: ObjectPropertyHelper.nameof(defaultValues, e => e.mobile)},
            buyCount: {name: ObjectPropertyHelper.nameof(defaultValues, e => e.buyCount), noMarkup: true},
            note: {label: "Ghi chú khác", name: ObjectPropertyHelper.nameof(defaultValues, e => e.note)},
        }),
        transformFunc: (values) => ({
            ...values,
            id: values.name.concat(nanoid(10))
        })
    })
    const area = Form.useWatch("area", addCustomerForm.form);

    const _onSave = () => {
        addCustomerForm.submit();
    }

    const _onChangeProvince = (value: string) => {
        addCustomerForm.form.setFieldsValue({area: AreaHelpers.parseAreaFromProvince(value)});
    }

    const _renderArea = () => {
        return Boolean(area) && <Tag>{area}</Tag>;
    }

    return <SmartForm {...addCustomerForm.defaultProps}>
        <SmartForm.Item {...addCustomerForm.itemDefinitions.name}>
            <Input placeholder="Nhập tên" autoFocus/>
        </SmartForm.Item>
        <SmartForm.Item {...addCustomerForm.itemDefinitions.address}>
            <TextArea rows={2} placeholder="Nhập địa chỉ"/>
        </SmartForm.Item>
        <SmartForm.Item {...addCustomerForm.itemDefinitions.province}>
            <Select
                suffixIcon={_renderArea()}
                showSearch
                placeholder="Chọn tỉnh thành"
                onChange={_onChangeProvince}
                filterOption={(inputValue, option) => {
                    if (!option?.children) return false;
                    return option?.children?.toString().toLowerCase().includes(inputValue.toLowerCase());
                }}
                style={{width: '100%'}}
            >
                {CUSTOMER_PROVINCES.map(p => <Option key={p} value={p}>{p}</Option>)}
            </Select>
        </SmartForm.Item>

        <SmartForm.Item {...addCustomerForm.itemDefinitions.mobile}>
            <Input placeholder="Nhập điện thoại"/>
        </SmartForm.Item>
        <SmartForm.Item {...addCustomerForm.itemDefinitions.difficulty}>
            <Select
                style={{width: '100%'}}>
                {CUSTOMER_DIFFUCULTIES.map(c => <Option key={c} value={c}>{c}</Option>)}
            </Select>
        </SmartForm.Item>
        <SmartForm.Item {...addCustomerForm.itemDefinitions.note}>
            <TextArea rows={2} placeholder="Nhập ghi chú khác"/>
        </SmartForm.Item>
        <Stack fullwidth justify="flex-end">
            <Button onClick={_onSave}>Lưu</Button>
        </Stack>
    </SmartForm>
}
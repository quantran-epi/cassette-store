import { ORDER_ITEM_TYPE } from "@common/Constants/AppConstants";
import { Button } from "@components/Button";
import { Option, Select } from "@components/Form/Select";
import { Col, Row } from "@components/Grid";
import { Stack } from "@components/Layout/Stack";
import { SmartForm, useSmartForm } from "@components/SmartForm";
import { OrderItem } from "@store/Models/OrderItem";
import { FunctionComponent, useEffect, useState } from "react";
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
import { ObjectPropertyHelper } from "@common/Helpers/ObjectProperty";
import { Typography } from "@components/Typography";
import { Space } from "antd";
import { useModal } from "@components/Modal/ModalProvider";
import { Form } from "@components/Form";
import { Modal } from "@components/Modal";
import { TextArea } from "@components/Form/Input";
import { useToggle } from "@hooks";
import { useMessage } from "@components/Message";

type OrderPlacedItemProps = {
    item: OrderItem;
    onDelete: (id: string) => void;
    onChange: (item: OrderItem) => void;
    allPlacedItems: OrderItem[];
}

export const OrderPlacedItem: FunctionComponent<OrderPlacedItemProps> = (props) => {
    const message = useMessage();
    const [isValid, setIsValid] = useState(true);
    const placedItemForm = useSmartForm<OrderItem>({
        defaultValues: {
            id: "",
            count: undefined,
            note: "",
            type: undefined,
            unitPrice: 0
        },
        onSubmit: (values) => {
            props.onChange(values.transformValues);
        },
        itemDefinitions: defaultValues => ({
            id: { name: ObjectPropertyHelper.nameof(defaultValues, e => e.id), noMarkup: true },
            count: { name: ObjectPropertyHelper.nameof(defaultValues, e => e.count) },
            unitPrice: { name: ObjectPropertyHelper.nameof(defaultValues, e => e.unitPrice), noMarkup: true },
            type: { name: ObjectPropertyHelper.nameof(defaultValues, e => e.type) },
            note: { name: ObjectPropertyHelper.nameof(defaultValues, e => e.note), noMarkup: true },
        })
    })

    useEffect(() => {
        placedItemForm.form.setFieldsValue(props.item);
    }, [props.item])

    const _onChangeType = (value: string) => {
        if (props.allPlacedItems.some(e => e.id != props.item.id && e.type == value)) {
            setIsValid(false);
            message.error("Đã có loại băng này, hãy chọn loại khác");
            return;
        }
        setIsValid(true);
        placedItemForm.form.setFieldsValue({ unitPrice: ORDER_ITEM_TYPE[value] });
        placedItemForm.submit();
    }

    const _onChangeCount = (value: string) => {
        placedItemForm.form.setFieldsValue({ count: parseInt(value) });
        placedItemForm.submit();
    }

    return <SmartForm {...placedItemForm.defaultProps}>
        <Row gutter={10}>
            <Col span={21}>
                <Row gutter={10}>
                    <Col span={14}>
                        <SmartForm.Item {...placedItemForm.itemDefinitions.type}>
                            <Select
                                status={isValid ? undefined : "error"}
                                onChange={_onChangeType}
                                popupMatchSelectWidth={200}
                                style={{ width: '100%' }}>
                                {Object.keys(ORDER_ITEM_TYPE).map(k => <Option key={k} value={k}>{k}</Option>)}
                            </Select>
                        </SmartForm.Item>
                    </Col>
                    <Col span={10}>
                        <SmartForm.Item {...placedItemForm.itemDefinitions.count}>
                            <Select
                                status={isValid ? undefined : "error"}
                                onChange={_onChangeCount}
                                popupMatchSelectWidth={100}
                                style={{ width: '100%' }}>
                                {new Array(10).fill(1).map((v, i) => <Option key={i + 1} value={i + 1}>{i + 1} băng</Option>)}
                            </Select>
                        </SmartForm.Item>
                    </Col>
                </Row>
            </Col>
            <Col span={3}>
                <Space>
                    <Button danger icon={<DeleteOutlined />} onClick={() => props.onDelete(props.item.id)} />
                </Space>
            </Col>
        </Row>
    </SmartForm>;
}
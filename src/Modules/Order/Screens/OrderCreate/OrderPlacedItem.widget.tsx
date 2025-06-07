import { ORDER_ITEM_TYPE } from "@common/Constants/AppConstants";
import { Button } from "@components/Button";
import { Option, Select } from "@components/Form/Select";
import { Col, Row } from "@components/Grid";
import { Stack } from "@components/Layout/Stack";
import { SmartForm, useSmartForm } from "@components/SmartForm";
import { OrderItem } from "@store/Models/OrderItem";
import { FunctionComponent } from "react";
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

type OrderPlacedItemProps = {
    item: OrderItem;
    onDelete: (id: string) => void;
}

export const OrderPlacedItem: FunctionComponent<OrderPlacedItemProps> = (props) => {
    const placedItemForm = useSmartForm<OrderItem>({
        defaultValues: props.item,
        itemDefinitions: defaultValues => ({
            id: { name: ObjectPropertyHelper.nameof(defaultValues, e => e.id), noMarkup: true },
            count: { name: ObjectPropertyHelper.nameof(defaultValues, e => e.count) },
            unitPrice: { name: ObjectPropertyHelper.nameof(defaultValues, e => e.unitPrice) },
            type: { name: ObjectPropertyHelper.nameof(defaultValues, e => e.type) },
            note: { name: ObjectPropertyHelper.nameof(defaultValues, e => e.note) },
        })
    })

    const _onChangeType = (value: string) => {
        placedItemForm.form.setFieldsValue({ unitPrice: ORDER_ITEM_TYPE[value] });
    }

    return <SmartForm {...placedItemForm.defaultProps}>
        <Row gutter={10}>
            <Col span={19}>
                <Row gutter={10}>
                    <Col span={15}>
                        <SmartForm.Item {...placedItemForm.itemDefinitions.type}>
                            <Select
                                onChange={_onChangeType}
                                popupMatchSelectWidth={200}
                                style={{ width: '100%' }}>
                                {Object.keys(ORDER_ITEM_TYPE).map(k => <Option key={k} value={k}>{k}</Option>)}
                            </Select>
                        </SmartForm.Item>
                    </Col>
                    <Col span={9}>
                        <SmartForm.Item {...placedItemForm.itemDefinitions.count}>
                            <Select
                                popupMatchSelectWidth={100}
                                style={{ width: '100%' }}>
                                {new Array(10).fill(1).map((v, i) => <Option key={i + 1} value={i + 1}>{i + 1} băng</Option>)}
                            </Select>
                        </SmartForm.Item>
                    </Col>
                </Row>
            </Col>
            <Col span={5}>
                <Space>
                    <Button icon={<EditOutlined />} onClick={() => props.onDelete(props.item.id)} />
                    <Button danger icon={<DeleteOutlined />} onClick={() => props.onDelete(props.item.id)} />
                </Space>
            </Col>
        </Row>
    </SmartForm>;
}
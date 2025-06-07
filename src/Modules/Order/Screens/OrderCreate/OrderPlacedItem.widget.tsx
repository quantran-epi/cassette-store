import { ORDER_ITEM_TYPE, ORDER_ITEM_UNIT_PRICE } from "@common/Constants/AppConstants";
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

    return <SmartForm {...placedItemForm.defaultProps}>
        <Row gutter={10}>
            <Col span={21}>
                <Row gutter={10}>
                    <Col span={8}>
                        <SmartForm.Item {...placedItemForm.itemDefinitions.type}>
                            <Select
                                style={{ width: '100%' }}>
                                {Object.keys(ORDER_ITEM_TYPE).map(k => <Option key={ORDER_ITEM_TYPE[k]} value={k}>{k}</Option>)}
                            </Select>
                        </SmartForm.Item>
                    </Col>
                    <Col span={8}>
                        <SmartForm.Item {...placedItemForm.itemDefinitions.unitPrice}>
                            <Select
                                style={{ width: '100%' }}>
                                {Object.keys(ORDER_ITEM_UNIT_PRICE).map(k => <Option key={ORDER_ITEM_UNIT_PRICE[k]} value={ORDER_ITEM_UNIT_PRICE[k]}>{k}</Option>)}
                            </Select>
                        </SmartForm.Item>
                    </Col>
                    <Col span={8}>
                        <SmartForm.Item {...placedItemForm.itemDefinitions.count}>
                            <Select
                                style={{ width: '100%' }}>
                                {new Array(10).fill(1).map((v, i) => <Option key={i + 1} value={i + 1}>{i + 1} băng</Option>)}
                            </Select>
                        </SmartForm.Item>
                    </Col>
                </Row>
            </Col>
            <Col span={3}>
                <Button danger icon={<DeleteOutlined />} />
            </Col>
        </Row>
    </SmartForm>;
}
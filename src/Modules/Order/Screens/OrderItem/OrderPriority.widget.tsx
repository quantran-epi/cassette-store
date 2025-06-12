import { ORDER_PRIORITY_STATUS } from "@common/Constants/AppConstants";
import { Button } from "@components/Button";
import { Radio } from "@components/Form/Radio";
import { Stack } from "@components/Layout/Stack";
import { useMessage } from "@components/Message";
import { Modal } from "@components/Modal";
import { SmartForm } from "@components/SmartForm";
import { useOrder, useToggle } from "@hooks";
import { Order } from "@store/Models/Order";
import { RadioChangeEvent } from "antd";
import { FunctionComponent, useEffect, useState } from "react"

type OrderPriorityProps = {
    order: Order;
    open: boolean;
    onClose: () => void;
}

export const OrderPriorityWidget: FunctionComponent<OrderPriorityProps> = props => {
    const [order, setOrder] = useState<Order>(props.order);
    const orderUtils = useOrder();
    const toggleLoading = useToggle();
    const message = useMessage();

    useEffect(() => {
        setOrder(props.order);
    }, [props.order]);

    const _onSave = async () => {
        toggleLoading.show();
        let card = await orderUtils.updateOrder(order);
        toggleLoading.hide();
        if (card) {
            message.success("Lưu độ ưu tiên thành công");
            props.onClose();
        } else message.error("Lỗi lưu độ ưu tiên")
    }

    const _onChangePriorityStatus = (e: RadioChangeEvent) => {
        setOrder({
            ...order,
            priorityStatus: e.target.value,
        })
    }

    return <Modal title={"Thông tin vận chuyển"} open={props.open} destroyOnClose={true} onCancel={props.onClose}
        footer={<Stack fullwidth justify="flex-end">
            <Button loading={toggleLoading.value} type="primary" onClick={_onSave}>Lưu</Button>
        </Stack>}>
        <SmartForm itemDefinitions={{}} layout={"vertical"}>
            <SmartForm.Item label="Độ ưu tiên">
                <Radio.Group
                    value={props.order.priorityStatus}
                    onChange={_onChangePriorityStatus}
                    options={[
                        { value: ORDER_PRIORITY_STATUS.NONE, label: ORDER_PRIORITY_STATUS.NONE },
                        { value: ORDER_PRIORITY_STATUS.PRIORITY, label: ORDER_PRIORITY_STATUS.PRIORITY },
                        { value: ORDER_PRIORITY_STATUS.URGENT, label: ORDER_PRIORITY_STATUS.URGENT },
                    ]}
                />
            </SmartForm.Item>
        </SmartForm>
    </Modal>
}
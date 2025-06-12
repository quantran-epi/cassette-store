import React, {FunctionComponent, useEffect, useState} from "react";
import {Order} from "@store/Models/Order";
import {useOrder, useToggle, useTrello} from "@hooks";
import {Modal} from "@components/Modal";
import {Stack} from "@components/Layout/Stack";
import {Button} from "@components/Button";
import {SmartForm} from "@components/SmartForm";
import {Checkbox} from "@components/Form/Checkbox";
import {Radio} from "@components/Form/Radio";
import {ORDER_PAYMENT_METHOD, ORDER_SHIPPING_PARTNER} from "@common/Constants/AppConstants";
import {InputNumber} from "@components/Form/InputNumber";
import {message} from "antd";
import {TrelloAttachment} from "../../../../Hooks/Trello/Models/TrelloAttachment";
import {RcFile} from "antd/es/upload";

type OrderAttachmentsWidgetProps = {
    order: Order;
    open: boolean;
    onClose: () => void;
}

export const OrderAttachmentsWidget: FunctionComponent<OrderAttachmentsWidgetProps> = props => {
    const trello = useTrello();
    const orderUtils = useOrder();
    const toggleLoading = useToggle();
    const [deleteAttachments, setDeleteAttachments] = useState<TrelloAttachment[]>([]);
    const [addAttachments, setAddAttachments] = useState<RcFile[]>([]);

    const _onSave = async () => {
        try {
            toggleLoading.show();
            let deletePromises = deleteAttachments.map(e => trello.deleteAttachment({idAttachment: e.id}, props.order.trelloCardId));
            let addPromises = orderUtils.attachImagesToOrderOnTrello(props.order, addAttachments);
            await Promise.all([deletePromises, addPromises]);
            toggleLoading.hide();
            message.success("Lưu Ảnh đính kèm thành công");
            props.onClose();
        }
        catch (e) {
            message.error("Lỗi lưu Ảnh đính kèm")
        }
    }

    return <Modal title={"Thông tin vận chuyển"} open={props.open} destroyOnClose={true} onCancel={props.onClose}
                  footer={<Stack fullwidth justify="flex-end">
                      <Button loading={toggleLoading.value} type="primary" onClick={_onSave}>Lưu</Button>
                  </Stack>}>

    </Modal>
}
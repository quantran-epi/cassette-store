import React, {FunctionComponent, useState} from "react";
import {CheckOutlined, SyncOutlined} from "@ant-design/icons";
import {ActionButton} from "@components/Button";
import {Space} from "@components/Layout/Space";
import {Stack} from "@components/Layout/Stack";
import {useMessage} from "@components/Message";
import {Tag} from "@components/Tag";
import {Typography} from "@components/Typography";
import {getOrderWorkflowMessage, hasOrderWorkflowSyncFailures, useOrder} from "@hooks";
import {OrderSyncFailure} from "@store/Models/OrderSyncFailure";

type OrderSyncStatusWidgetProps = {
    failures: OrderSyncFailure[];
}

const _getOperationLabel = (failure: OrderSyncFailure): string => {
    switch (failure.operation) {
        case "create-card":
            return "Tạo thẻ Trello";
        case "update-card":
            return "Cập nhật thẻ Trello";
        case "move-card":
            return "Chuyển thẻ Trello";
        case "create-comment":
            return "Bình luận mã vận đơn";
        case "create-attachment":
            return "Đồng bộ ảnh";
        default:
            return "Đồng bộ Trello";
    }
}

export const OrderSyncStatusWidget: FunctionComponent<OrderSyncStatusWidgetProps> = ({failures}) => {
    const orderUtils = useOrder();
    const message = useMessage();
    const [retryingId, setRetryingId] = useState<string>(null);
    const [clearingId, setClearingId] = useState<string>(null);

    if (!failures || failures.length === 0) return null;

    const _onRetry = async (failure: OrderSyncFailure) => {
        setRetryingId(failure.id);
        const result = await orderUtils.retryOrderSyncFailure(failure.id);
        setRetryingId(null);

        if (!result.localUpdated) message.error(getOrderWorkflowMessage(result));
        else if (hasOrderWorkflowSyncFailures(result)) message.warning(getOrderWorkflowMessage(result));
        else message.success("Đồng bộ Trello thành công");
    }

    const _onClear = (failure: OrderSyncFailure) => {
        setClearingId(failure.id);
        orderUtils.clearOrderSyncFailure(failure.id);
        setClearingId(null);
        message.success("Đã ẩn lỗi đồng bộ Trello");
    }

    return <Stack direction="column" align="flex-start" gap={4}>
        {failures.map(failure => <Stack key={failure.id} direction="column" align="flex-start" gap={2}>
            <Space wrap>
                <Tag color="warning">Lỗi đồng bộ Trello</Tag>
                <Typography.Text type="secondary">{_getOperationLabel(failure)}: {failure.message}</Typography.Text>
            </Space>
            <Space size="small" wrap>
                <ActionButton
                    tone="warning"
                    icon={<SyncOutlined/>}
                    loading={retryingId === failure.id}
                    disabled={!failure.retryable}
                    onClick={() => _onRetry(failure)}>
                    Thử lại
                </ActionButton>
                <ActionButton
                    tone="default"
                    icon={<CheckOutlined/>}
                    loading={clearingId === failure.id}
                    onClick={() => _onClear(failure)}>
                    Đã xử lý
                </ActionButton>
            </Space>
        </Stack>)}
    </Stack>
}

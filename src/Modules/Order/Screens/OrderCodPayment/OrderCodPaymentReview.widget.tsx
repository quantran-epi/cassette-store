import React, {FunctionComponent, useMemo} from "react";
import {Alert} from "@components/Alert";
import {Button} from "@components/Button";
import {Checkbox} from "@components/Form/Checkbox";
import {Option, Select} from "@components/Form/Select";
import {Stack} from "@components/Layout/Stack";
import {Space} from "@components/Layout/Space";
import {Tag} from "@components/Tag";
import {Typography} from "@components/Typography";
import {Tabs} from "@components/Tabs";
import {Popconfirm} from "@components/Popconfirm";
import {CheckCircleOutlined, ExclamationCircleOutlined} from "@ant-design/icons";
import type {TabsProps} from "antd";
import type {Order} from "@store/Models/Order";
import {
    canApplyCodImportReview,
    isCodImportReviewDebitFeeRow,
    isCodImportReviewPaymentRow,
    updateCodImportReviewRow
} from "@common/Helpers/CodPaymentImportHelper";
import type {CodImportReview, CodImportReviewBucket, CodImportReviewRow} from "@common/Helpers/CodPaymentImportHelper";
import {appTokens} from "../../../../theme/tokens";

type OrderCodPaymentReviewWidgetProps = {
    review: CodImportReview;
    orders: Order[];
    onChange: (review: CodImportReview) => void;
    onApply?: () => void;
    applying?: boolean;
}

const BUCKET_LABELS: Record<CodImportReviewBucket, string> = {
    matched: "Đã khớp",
    unmatched: "Chưa khớp",
    duplicate: "Trùng",
    "amount-mismatch": "Lệch số tiền",
    "already-paid": "Đã thanh toán"
}

const BUCKET_ORDER: CodImportReviewBucket[] = ["matched", "unmatched", "duplicate", "amount-mismatch", "already-paid"];

const formatCurrency = (value?: number | null): string => {
    if (value === null || value === undefined) return "-";
    return `${value.toLocaleString()} đ`;
}

export const OrderCodPaymentReviewWidget: FunctionComponent<OrderCodPaymentReviewWidgetProps> = (props) => {
    const applyReady = canApplyCodImportReview(props.review);
    const confirmedCount = props.review.rows.filter(row => row.included && row.confirmed && row.bucket === "matched").length;
    const unresolvedCount = props.review.rows.filter(row => row.included && (!row.confirmed || row.issueIds.length > 0 || row.bucket !== "matched")).length;

    const selectableOrders = useMemo(() => {
        return props.orders.map(order => ({
            id: order.id,
            label: `${order.name} (${order.shippingCode || "chưa có mã"})`,
            order
        }));
    }, [props.orders]);

    const _onRowToggle = (row: CodImportReviewRow, included: boolean) => {
        props.onChange(updateCodImportReviewRow(props.review, row.id, {included}));
    }

    const _onManualResolve = (row: CodImportReviewRow, orderId?: string) => {
        const order = props.orders.find(item => item.id === orderId);
        if (!order) return;
        props.onChange(updateCodImportReviewRow(props.review, row.id, {
            bucket: "matched",
            included: true,
            confirmed: true,
            matchedOrderId: order.id,
            matchedOrderName: order.name,
            currentCodAmount: order.codAmount,
            issueIds: []
        }));
    }

    const _renderRow = (row: CodImportReviewRow) => {
        return <Stack key={row.id} direction="column" align="stretch" fullwidth gap={appTokens.space.sm} style={{padding: appTokens.space.sm, borderBottom: `1px solid ${appTokens.color.border}`}}>
            <Stack direction="row" justify="space-between" align="flex-start" wrap="wrap" fullwidth gap={appTokens.space.sm}>
                <Stack direction="column" align="flex-start" gap={appTokens.space.xs}>
                    <Space wrap>
                        <Tag>Dòng {row.rowNumber}</Tag>
                        <Typography.Text strong>{row.shippingCode || "Chưa có mã vận đơn"}</Typography.Text>
                        {row.confirmed && row.bucket === "matched" ? <Tag color="success" icon={<CheckCircleOutlined/>}>Đã xác nhận</Tag> : <Tag color="warning" icon={<ExclamationCircleOutlined/>}>Cần kiểm tra</Tag>}
                    </Space>
                    <Typography.Text type="secondary">Đã khớp với đơn: {row.matchedOrderName || row.matchedOrderId || "-"}</Typography.Text>
                </Stack>
                <Checkbox checked={row.included} onChange={event => _onRowToggle(row, event.target.checked)}>
                    Bao gồm
                </Checkbox>
            </Stack>

            <Stack direction="row" wrap="wrap" gap={appTokens.space.sm} fullwidth>
                <Tag>COD từ file: {formatCurrency(row.importedCodAmount)}</Tag>
                <Tag>Phí ship từ file: {formatCurrency(row.importedShippingFee)}</Tag>
                <Tag>COD trong app: {formatCurrency(row.currentCodAmount)}</Tag>
                {isCodImportReviewPaymentRow(row) && <Tag color="green">Dòng thanh toán</Tag>}
                {isCodImportReviewDebitFeeRow(row) && <Tag color="blue">Dòng phí ship</Tag>}
            </Stack>

            <Stack direction="row" align="center" wrap="wrap" fullwidth gap={appTokens.space.sm}>
                <Select
                    showSearch
                    allowClear
                    placeholder="Chọn đơn để xử lý thủ công"
                    value={row.matchedOrderId}
                    onChange={(orderId) => _onManualResolve(row, orderId)}
                    filterOption={(inputValue, option) => {
                        if (!option?.children) return false;
                        return option.children.toString().toLowerCase().includes(inputValue.toLowerCase());
                    }}
                    style={{flex: "1 1 220px", minWidth: 0}}
                >
                    {selectableOrders.map(option => <Option key={option.id} value={option.id}>{option.label}</Option>)}
                </Select>
                <Typography.Text type="secondary">Bỏ chọn hoặc khớp đơn trước khi áp dụng.</Typography.Text>
            </Stack>
        </Stack>
    }

    const items: TabsProps["items"] = BUCKET_ORDER.map(bucket => ({
        key: bucket,
        label: `${BUCKET_LABELS[bucket]} (${props.review.buckets[bucket].length})`,
        children: props.review.buckets[bucket].length > 0
            ? <Stack direction="column" align="stretch" fullwidth gap={0}>{props.review.buckets[bucket].map(_renderRow)}</Stack>
            : <Typography.Text type="secondary">Không có dòng nào trong nhóm này</Typography.Text>
    }));

    return <Stack direction="column" align="stretch" fullwidth gap={appTokens.space.sm}>
        {unresolvedCount > 0 && <Alert type="warning" showIcon message="Có dòng cần kiểm tra. Xử lý hoặc bỏ chọn trước khi áp dụng." />}

        <Stack direction="row" justify="space-between" align="center" wrap="wrap" fullwidth gap={appTokens.space.sm}>
            <Space wrap>
                <Tag color="success">Đã xác nhận: {confirmedCount}</Tag>
                <Tag color={unresolvedCount > 0 ? "warning" : "default"}>Cần xử lý: {unresolvedCount}</Tag>
            </Space>
            <Popconfirm
                title="Áp dụng các dòng COD đã xác nhận?"
                description="Các đơn đã khớp sẽ được đánh dấu đã trả COD."
                disabled={!applyReady || !props.onApply}
                onConfirm={props.onApply}
            >
                <Button
                    type="primary"
                    disabled={!applyReady || !props.onApply}
                    loading={props.applying}
                >
                    Áp dụng các dòng COD đã xác nhận
                </Button>
            </Popconfirm>
        </Stack>

        <Space wrap>
            {BUCKET_ORDER.map(bucket => <Tag key={bucket}>{BUCKET_LABELS[bucket]}: {props.review.buckets[bucket].length}</Tag>)}
        </Space>

        <Tabs items={items} />
    </Stack>
}

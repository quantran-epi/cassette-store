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

type OrderCodPaymentReviewWidgetProps = {
    review: CodImportReview;
    orders: Order[];
    onChange: (review: CodImportReview) => void;
    onApply?: () => void;
    applying?: boolean;
}

const BUCKET_LABELS: Record<CodImportReviewBucket, string> = {
    matched: "Matched",
    unmatched: "Unmatched",
    duplicate: "Duplicate",
    "amount-mismatch": "Amount mismatch",
    "already-paid": "Already paid"
}

const BUCKET_ORDER: CodImportReviewBucket[] = ["matched", "unmatched", "duplicate", "amount-mismatch", "already-paid"];

const formatCurrency = (value?: number | null): string => {
    if (value === null || value === undefined) return "-";
    return `${value.toLocaleString()} đ`;
}

export const OrderCodPaymentReviewWidget: FunctionComponent<OrderCodPaymentReviewWidgetProps> = (props) => {
    const applyReady = canApplyCodImportReview(props.review);
    const includedConfirmedCount = props.review.rows.filter(row => row.included && row.confirmed && row.bucket === "matched").length;
    const unresolvedIncludedCount = props.review.rows.filter(row => row.included && (!row.confirmed || row.issueIds.length > 0 || row.bucket !== "matched")).length;

    const selectableOrders = useMemo(() => {
        return props.orders.map(order => ({
            id: order.id,
            label: `${order.name} (${order.shippingCode || "no code"})`,
            order
        }));
    }, [props.orders]);

    const _onIncludeChange = (row: CodImportReviewRow, included: boolean) => {
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
        return <Stack key={row.id} direction="column" align="stretch" fullwidth gap={8} style={{padding: 12, borderBottom: "1px solid #d9d9d9"}}>
            <Stack direction="row" justify="space-between" align="flex-start" wrap="wrap" fullwidth gap={8}>
                <Stack direction="column" align="flex-start" gap={4}>
                    <Space wrap>
                        <Tag>Row {row.rowNumber}</Tag>
                        <Typography.Text strong>{row.shippingCode || "No shipping code"}</Typography.Text>
                        {row.confirmed && row.bucket === "matched" ? <Tag color="success" icon={<CheckCircleOutlined/>}>Confirmed</Tag> : <Tag color="warning" icon={<ExclamationCircleOutlined/>}>Needs review</Tag>}
                    </Space>
                    <Typography.Text type="secondary">Matched order: {row.matchedOrderName || row.matchedOrderId || "-"}</Typography.Text>
                </Stack>
                <Checkbox checked={row.included} onChange={event => _onIncludeChange(row, event.target.checked)}>
                    Include
                </Checkbox>
            </Stack>

            <Stack direction="row" wrap="wrap" gap={8} fullwidth>
                <Tag>Imported COD: {formatCurrency(row.importedCodAmount)}</Tag>
                <Tag>Imported shipping fee: {formatCurrency(row.importedShippingFee)}</Tag>
                <Tag>Current app COD: {formatCurrency(row.currentCodAmount)}</Tag>
                {isCodImportReviewPaymentRow(row) && <Tag color="green">Payment row</Tag>}
                {isCodImportReviewDebitFeeRow(row) && <Tag color="blue">Debit shipping fee</Tag>}
            </Stack>

            <Stack direction="row" align="center" wrap="wrap" fullwidth gap={8}>
                <Select
                    showSearch
                    allowClear
                    placeholder="Manual resolve"
                    value={row.matchedOrderId}
                    onChange={(orderId) => _onManualResolve(row, orderId)}
                    filterOption={(inputValue, option) => {
                        if (!option?.children) return false;
                        return option.children.toString().toLowerCase().includes(inputValue.toLowerCase());
                    }}
                    style={{minWidth: 260, flex: 1}}
                >
                    {selectableOrders.map(option => <Option key={option.id} value={option.id}>{option.label}</Option>)}
                </Select>
                <Typography.Text type="secondary">Include/exclude or resolve before applying.</Typography.Text>
            </Stack>
        </Stack>
    }

    const items: TabsProps["items"] = BUCKET_ORDER.map(bucket => ({
        key: bucket,
        label: `${BUCKET_LABELS[bucket]} (${props.review.buckets[bucket].length})`,
        children: props.review.buckets[bucket].length > 0
            ? <Stack direction="column" align="stretch" fullwidth gap={0}>{props.review.buckets[bucket].map(_renderRow)}</Stack>
            : <Typography.Text type="secondary">No rows in this bucket.</Typography.Text>
    }));

    return <Stack direction="column" align="stretch" fullwidth gap={12}>
        {unresolvedIncludedCount > 0 && <Alert type="warning" showIcon message="Some rows need review. Resolve or exclude them before applying." />}

        <Stack direction="row" justify="space-between" align="center" wrap="wrap" fullwidth gap={8}>
            <Space wrap>
                <Tag color="success">Confirmed included: {includedConfirmedCount}</Tag>
                <Tag color={unresolvedIncludedCount > 0 ? "warning" : "default"}>Unresolved included: {unresolvedIncludedCount}</Tag>
            </Space>
            <Button
                type="primary"
                disabled={!applyReady || !props.onApply}
                loading={props.applying}
                onClick={props.onApply}
            >
                Apply confirmed COD rows
            </Button>
        </Stack>

        <Tabs items={items} />
    </Stack>
}

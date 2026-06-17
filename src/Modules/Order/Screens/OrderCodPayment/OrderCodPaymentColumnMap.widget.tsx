import React, {FunctionComponent, useMemo} from "react";
import {Stack} from "@components/Layout/Stack";
import {Typography} from "@components/Typography";
import {Option, Select} from "@components/Form/Select";
import {Tag} from "@components/Tag";
import type {CodImportColumnKey, CodImportColumnMap, CodImportRawRow} from "@common/Helpers/CodPaymentImportHelper";

type OrderCodPaymentColumnMapWidgetProps = {
    rawRows: CodImportRawRow[];
    columnMap: CodImportColumnMap;
    onChange: (columnMap: CodImportColumnMap) => void;
}

const COLUMN_LABELS: Record<CodImportColumnKey, string> = {
    shippingCode: "Shipping code",
    codAmount: "COD amount",
    shippingFee: "Shipping fee",
    status: "Status",
    paidDate: "Paid date"
}

const COLUMN_KEYS: CodImportColumnKey[] = ["shippingCode", "codAmount", "shippingFee", "status", "paidDate"];

export const OrderCodPaymentColumnMapWidget: FunctionComponent<OrderCodPaymentColumnMapWidgetProps> = (props) => {
    const sourceColumns = useMemo(() => {
        const columns = new Set<string>();
        props.rawRows.forEach(row => Object.keys(row.values || {}).forEach(column => columns.add(column)));
        return Array.from(columns);
    }, [props.rawRows]);

    const _onChange = (key: CodImportColumnKey, value?: string) => {
        props.onChange({
            ...props.columnMap,
            [key]: value || undefined
        });
    }

    return <Stack direction="column" align="stretch" fullwidth gap={12} style={{padding: 12, border: "1px solid #d9d9d9", borderRadius: 6}}>
        <Stack direction="column" gap={4} align="flex-start">
            <Typography.Text strong>Map columns manually</Typography.Text>
            <Typography.Text type="secondary">Detected columns: {sourceColumns.length > 0 ? sourceColumns.map(column => <Tag key={column}>{column}</Tag>) : "None"}</Typography.Text>
        </Stack>

        <Stack direction="column" align="stretch" fullwidth gap={8}>
            {COLUMN_KEYS.map(key => <Stack key={key} direction="column" align="stretch" fullwidth gap={4}>
                <Typography.Text>{COLUMN_LABELS[key]}</Typography.Text>
                <Select
                    allowClear
                    placeholder={`Select ${COLUMN_LABELS[key]}`}
                    value={props.columnMap[key]}
                    onChange={(value) => _onChange(key, value)}
                    style={{width: "100%"}}
                >
                    {sourceColumns.map(column => <Option key={column} value={column}>{column}</Option>)}
                </Select>
            </Stack>)}
        </Stack>
    </Stack>
}

import React, {FunctionComponent, useState} from "react";
import {Upload} from "antd";
import {Alert} from "@components/Alert";
import {Button} from "@components/Button";
import {Empty} from "@components/Empty";
import {Stack} from "@components/Layout/Stack";
import {Space} from "@components/Layout/Space";
import {Tag} from "@components/Tag";
import {Typography} from "@components/Typography";
import {useMessage} from "@components/Message";
import {useModal} from "@components/Modal/ModalProvider";
import {FileExcelOutlined, SettingOutlined, UploadOutlined} from "@ant-design/icons";
import type {Order} from "@store/Models/Order";
import {
    buildCodImportApplyPayload,
    buildCodImportColumnMap,
    buildCodImportReview,
    detectKnownCodColumns,
    normalizeCodImportRows,
    parseCodWorkbookRows
} from "@common/Helpers/CodPaymentImportHelper";
import type {CodImportApplyPayload, CodImportColumnDetection, CodImportColumnMap, CodImportRawRow, CodImportReview} from "@common/Helpers/CodPaymentImportHelper";
import {OrderCodPaymentColumnMapWidget} from "./OrderCodPaymentColumnMap.widget";
import {OrderCodPaymentReviewWidget} from "./OrderCodPaymentReview.widget";

type OrderCodPaymentImportWidgetProps = {
    orders: Order[];
    onApply?: (payload: CodImportApplyPayload) => void;
    applying?: boolean;
}

const LOW_CONFIDENCE_THRESHOLD = 0.8;

export const OrderCodPaymentImportWidget: FunctionComponent<OrderCodPaymentImportWidgetProps> = (props) => {
    const [rawRows, setRawRows] = useState<CodImportRawRow[]>([]);
    const [columnMap, setColumnMap] = useState<CodImportColumnMap>({});
    const [detection, setDetection] = useState<CodImportColumnDetection | null>(null);
    const [review, setReview] = useState<CodImportReview | null>(null);
    const [parseError, setParseError] = useState("");
    const [parsing, setParsing] = useState(false);
    const [showColumnMap, setShowColumnMap] = useState(false);
    const modal = useModal();
    const message = useMessage();

    const _buildReview = (rows: CodImportRawRow[], nextColumnMap: CodImportColumnMap) => {
        const settlementRows = normalizeCodImportRows(rows, nextColumnMap);
        setReview(buildCodImportReview(settlementRows, props.orders, nextColumnMap));
    }

    const _onParseFile = async (file: File) => {
        setParsing(true);
        setParseError("");
        try {
            const rows = await parseCodWorkbookRows(file);
            const nextDetection = detectKnownCodColumns(rows);
            const nextColumnMap = buildCodImportColumnMap(rows);
            setRawRows(rows);
            setDetection(nextDetection);
            setColumnMap(nextColumnMap);
            setShowColumnMap(nextDetection.confidence < LOW_CONFIDENCE_THRESHOLD || nextDetection.missingRequiredColumns.length > 0);
            _buildReview(rows, nextColumnMap);
        } catch (e) {
            setParseError("Could not read this COD file. Map columns manually or choose another file.");
        } finally {
            setParsing(false);
        }
    }

    const _onColumnMapChange = (nextColumnMap: CodImportColumnMap) => {
        setColumnMap(nextColumnMap);
        if (rawRows.length > 0) _buildReview(rawRows, nextColumnMap);
    }

    const _onBeforeUpload = (file: File): boolean => {
        void _onParseFile(file);
        return false;
    }

    const _clearReview = () => {
        setRawRows([]);
        setColumnMap({});
        setDetection(null);
        setReview(null);
        setShowColumnMap(false);
    }

    const _onApply = () => {
        if (!review || !props.onApply) return;
        modal.confirm({
            title: "Apply COD payments: confirmed rows will mark matched orders as paid COD.",
            onOk: () => {
                try {
                    props.onApply(buildCodImportApplyPayload(review));
                    message.success("COD payments applied");
                    _clearReview();
                } catch (e) {
                    message.error(e?.message || "Could not apply COD payments");
                }
            }
        });
    }

    return <Stack direction="column" align="stretch" fullwidth gap={16} style={{marginTop: 16}}>
        <Stack direction="row" justify="space-between" align="center" wrap="wrap" fullwidth gap={8}>
            <Stack direction="column" gap={4} align="flex-start">
                <Typography.Text strong>COD import</Typography.Text>
                <Typography.Text type="secondary">Import a COD Excel file to review matched orders before applying payment.</Typography.Text>
            </Stack>
            <Space wrap>
                <Upload
                    accept=".xlsx,.xls,.csv"
                    beforeUpload={_onBeforeUpload}
                    showUploadList={false}
                    multiple={false}
                >
                    <Button type="primary" icon={<UploadOutlined/>} loading={parsing}>Import COD Excel</Button>
                </Upload>
                <Button icon={<SettingOutlined/>} disabled={rawRows.length === 0} onClick={() => setShowColumnMap(!showColumnMap)}>
                    Map columns manually
                </Button>
            </Space>
        </Stack>

        {parseError && <Alert type="error" showIcon message={parseError} />}

        {detection && <Space wrap>
            <Tag icon={<FileExcelOutlined/>}>Rows: {rawRows.length}</Tag>
            <Tag color={detection.confidence >= LOW_CONFIDENCE_THRESHOLD ? "success" : "warning"}>Detection: {Math.round(detection.confidence * 100)}%</Tag>
            {detection.missingRequiredColumns.map(column => <Tag key={column} color="error">Missing {column}</Tag>)}
        </Space>}

        {showColumnMap && rawRows.length > 0 && <OrderCodPaymentColumnMapWidget
            rawRows={rawRows}
            columnMap={columnMap}
            onChange={_onColumnMapChange}
        />}

        {!review && <div style={{border: "1px solid #d9d9d9", borderRadius: 6, padding: 16}}>
            <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={<Stack direction="column" gap={4} align="center">
                    <Typography.Text strong>No COD file imported</Typography.Text>
                    <Typography.Text type="secondary">Import a COD Excel file to review matched orders before applying payment.</Typography.Text>
                </Stack>}
            />
        </div>}

        {review && <OrderCodPaymentReviewWidget
            review={review}
            orders={props.orders}
            onChange={setReview}
            onApply={props.onApply ? _onApply : undefined}
            applying={props.applying}
        />}
    </Stack>
}

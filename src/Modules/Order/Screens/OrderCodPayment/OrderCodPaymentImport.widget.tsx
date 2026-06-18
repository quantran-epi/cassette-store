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
import {useDispatch} from "react-redux";
import {clearCodImportIssueStatus, setCodImportIssueStatus} from "@store/Reducers/AppContextReducer";
import {appTokens} from "../../../../theme/tokens";

type OrderCodPaymentImportWidgetProps = {
    orders: Order[];
    onApply?: (payload: CodImportApplyPayload) => void;
    applying?: boolean;
}

const LOW_CONFIDENCE_THRESHOLD = 0.8;
const COD_REVIEW_ISSUE_TEXT = "Có dòng cần kiểm tra. Xử lý hoặc bỏ chọn trước khi áp dụng.";

const COLUMN_LABELS: Record<string, string> = {
    shippingCode: "Mã vận đơn",
    codAmount: "Tiền COD",
    shippingFee: "Phí vận chuyển",
    status: "Trạng thái",
    paidDate: "Ngày trả COD"
}

const _countUnresolvedIncludedRows = (review: CodImportReview): number => {
    return review.rows.filter(row => row.included && (!row.confirmed || row.issueIds.length > 0 || row.bucket !== "matched")).length;
}

export const OrderCodPaymentImportWidget: FunctionComponent<OrderCodPaymentImportWidgetProps> = (props) => {
    const [rawRows, setRawRows] = useState<CodImportRawRow[]>([]);
    const [columnMap, setColumnMap] = useState<CodImportColumnMap>({});
    const [detection, setDetection] = useState<CodImportColumnDetection | null>(null);
    const [review, setReview] = useState<CodImportReview | null>(null);
    const [parseError, setParseError] = useState("");
    const [parsing, setParsing] = useState(false);
    const [showColumnMap, setShowColumnMap] = useState(false);
    const dispatch = useDispatch();
    const message = useMessage();

    const _syncCodImportIssueStatus = (nextReview: CodImportReview) => {
        const unresolvedCount = _countUnresolvedIncludedRows(nextReview);
        if (unresolvedCount > 0) dispatch(setCodImportIssueStatus({
            count: unresolvedCount,
            text: COD_REVIEW_ISSUE_TEXT
        }));
        else dispatch(clearCodImportIssueStatus());
    }

    const _onReviewChange = (nextReview: CodImportReview) => {
        setReview(nextReview);
        _syncCodImportIssueStatus(nextReview);
    }

    const _buildReview = (rows: CodImportRawRow[], nextColumnMap: CodImportColumnMap) => {
        const settlementRows = normalizeCodImportRows(rows, nextColumnMap);
        const nextReview = buildCodImportReview(settlementRows, props.orders, nextColumnMap);
        _onReviewChange(nextReview);
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
            setParseError("Không đọc được file COD này. Gán cột thủ công hoặc chọn file khác.");
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
        dispatch(clearCodImportIssueStatus());
    }

    const _onApply = () => {
        if (!review || !props.onApply) return;
        try {
            props.onApply(buildCodImportApplyPayload(review));
            message.success("Đã áp dụng COD");
            _clearReview();
        } catch (e) {
            const errorText = e?.message || "Không áp dụng được COD";
            dispatch(setCodImportIssueStatus({
                count: Math.max(_countUnresolvedIncludedRows(review), 1),
                text: errorText
            }));
            message.error(errorText);
        }
    }

    return <Stack direction="column" align="stretch" fullwidth gap={appTokens.space.md} style={{marginTop: appTokens.space.md}}>
        <Stack direction="row" justify="space-between" align="center" wrap="wrap" fullwidth gap={appTokens.space.sm}>
            <Stack direction="column" gap={appTokens.space.xs} align="flex-start">
                <Typography.Text strong>Nhập COD</Typography.Text>
                <Typography.Text type="secondary">Nhập file Excel COD để kiểm tra đơn đã khớp trước khi áp dụng thanh toán.</Typography.Text>
            </Stack>
            <Space wrap>
                <Upload
                    accept=".xlsx,.xls,.csv"
                    beforeUpload={_onBeforeUpload}
                    showUploadList={false}
                    multiple={false}
                >
                    <Button type="primary" icon={<UploadOutlined/>} loading={parsing}>Nhập Excel COD</Button>
                </Upload>
                <Button icon={<SettingOutlined/>} disabled={rawRows.length === 0} onClick={() => setShowColumnMap(!showColumnMap)}>
                    Gán cột thủ công
                </Button>
            </Space>
        </Stack>

        {parseError && <Alert type="error" showIcon message={parseError} />}

        {detection && <Space wrap>
            <Tag icon={<FileExcelOutlined/>}>Dòng: {rawRows.length}</Tag>
            <Tag color={detection.confidence >= LOW_CONFIDENCE_THRESHOLD ? "success" : "warning"}>Tự nhận diện: {Math.round(detection.confidence * 100)}%</Tag>
            {detection.missingRequiredColumns.map(column => <Tag key={column} color="error">Thiếu {COLUMN_LABELS[column]}</Tag>)}
        </Space>}

        {showColumnMap && rawRows.length > 0 && <OrderCodPaymentColumnMapWidget
            rawRows={rawRows}
            columnMap={columnMap}
            onChange={_onColumnMapChange}
        />}

        {!review && <div style={{border: `1px solid ${appTokens.color.border}`, borderRadius: appTokens.radius.base, padding: appTokens.space.md}}>
            <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={<Stack direction="column" gap={appTokens.space.xs} align="center">
                    <Typography.Text strong>Chưa nhập file COD</Typography.Text>
                    <Typography.Text type="secondary">Nhập file Excel COD để kiểm tra đơn đã khớp trước khi áp dụng thanh toán.</Typography.Text>
                </Stack>}
            />
        </div>}

        {review && <OrderCodPaymentReviewWidget
            review={review}
            orders={props.orders}
            onChange={_onReviewChange}
            onApply={props.onApply ? _onApply : undefined}
            applying={props.applying}
        />}
    </Stack>
}

import {
    CloudUploadOutlined,
    CreditCardOutlined,
    DropboxOutlined,
    ExclamationCircleOutlined,
    SyncOutlined
} from "@ant-design/icons";
import type {OperationalStatusLine, OperationalStatusReadModel} from "@store/Selectors/OperationalStatusSelectors";
import {Button} from "@components/Button";
import {Box} from "@components/Layout/Box";
import {Space} from "@components/Layout/Space";
import {Stack} from "@components/Layout/Stack";
import {Tag} from "@components/Tag";
import {Typography} from "@components/Typography";
import {useTheme} from "@hooks";
import React, {FunctionComponent} from "react";

type OperationalStatusTrayWidgetProps = {
    readModel: OperationalStatusReadModel;
    onViewFailedSyncOrders: () => void;
    onOpenCodReview: () => void;
    onBackupNow: () => void;
    onRefreshDoneOrders: () => void;
}

const _statusColor = (line: OperationalStatusLine): string => {
    switch (line.severity) {
        case "loading":
            return "processing";
        case "success":
            return "success";
        case "warning":
            return "warning";
        case "error":
            return "error";
        default:
            return "default";
    }
}

const _statusIcon = (line: OperationalStatusLine) => {
    switch (line.kind) {
        case "sync":
            return <SyncOutlined/>;
        case "cod":
            return <CreditCardOutlined/>;
        case "backup":
            return <CloudUploadOutlined/>;
        case "done":
            return <DropboxOutlined/>;
        default:
            return <ExclamationCircleOutlined/>;
    }
}

export const OperationalStatusTrayWidget: FunctionComponent<OperationalStatusTrayWidgetProps> = (props) => {
    const theme = useTheme();

    if (!props.readModel.hasIssues) return null;

    return <Box style={{
        position: "fixed",
        right: 24,
        bottom: 132,
        width: 336,
        maxWidth: "calc(100vw - 48px)",
        backgroundColor: "#fff",
        border: "0.5px solid " + theme.token.colorBorder,
        borderRadius: 8,
        padding: 8,
        zIndex: 10,
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)"
    }}>
        <Stack direction="column" align="stretch" gap={8} fullwidth>
            {props.readModel.lines.map(line => <Stack key={line.kind} direction="column" align="stretch" gap={4} fullwidth>
                <Space wrap>
                    <Tag icon={_statusIcon(line)} color={_statusColor(line)} style={{marginInlineEnd: 0}}>
                        {line.title}
                    </Tag>
                    <Typography.Text type="secondary" style={{fontSize: 12}}>{line.text}</Typography.Text>
                </Space>
                {line.kind === "sync" && <Button size="small" icon={<SyncOutlined/>} onClick={props.onViewFailedSyncOrders}>View failed sync orders</Button>}
                {line.kind === "cod" && <Button size="small" icon={<CreditCardOutlined/>} onClick={props.onOpenCodReview}>Open COD review</Button>}
            </Stack>)}
            <Space size="small" wrap>
                <Button size="small" icon={<CloudUploadOutlined/>} onClick={props.onBackupNow}>Backup now</Button>
                <Button size="small" icon={<DropboxOutlined/>} onClick={props.onRefreshDoneOrders}>Refresh done orders</Button>
            </Space>
        </Stack>
    </Box>
}

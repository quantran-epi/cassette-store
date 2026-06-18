import React from "react";
import { useSelector } from "react-redux";
import { useScreenTitle } from "@hooks";
import { Card } from "@components/Card";
import { List } from "@components/List";
import { Stack } from "@components/Layout/Stack";
import { Tag } from "@components/Tag";
import { TruncatedText, Typography } from "@components/Typography";
import {
    CustomerDashboardItem,
    DashboardDecisionGroup,
    DashboardDecisionMetric,
    selectDashboardReadModel
} from "@store/Selectors/DashboardSelectors";
import { appTokens } from "../../../theme/tokens";

const formatMetricValue = (metric: DashboardDecisionMetric): string => {
    const value = metric.value.toLocaleString();
    return metric.suffix ? `${value} ${metric.suffix}` : value;
}

const renderDecisionMetric = (metric: DashboardDecisionMetric) => <div
    key={metric.key}
    style={{
        alignItems: "center",
        borderBottom: `1px solid ${appTokens.color.border}`,
        display: "flex",
        gap: appTokens.space.sm,
        justifyContent: "space-between",
        minHeight: appTokens.control.height,
        padding: `${appTokens.space.xs}px 0`,
        width: "100%"
    }}
>
    <Typography.Text type="secondary" style={{fontSize: appTokens.font.label}}>{metric.label}</Typography.Text>
    <Typography.Text strong style={{color: metric.color, fontSize: appTokens.font.heading, whiteSpace: "nowrap"}}>
        {formatMetricValue(metric)}
    </Typography.Text>
</div>

const renderDecisionGroup = (group: DashboardDecisionGroup) => <Card
    key={group.key}
    data-testid={`dashboard-group-${group.key}`}
    title={group.title}
    description={group.description}
    styles={{body: {paddingTop: appTokens.space.sm}}}
>
    <Stack fullwidth direction="column" align="stretch" gap={appTokens.space.xs}>
        {group.metrics.map(renderDecisionMetric)}
    </Stack>
</Card>

const renderCustomerName = (item: CustomerDashboardItem, text?: string) => <TruncatedText
    text={text || `${item.customer.name}-${item.customer.province}`}
    maxLength={32}
    style={{
        color: item.color,
        flex: 1,
        minWidth: 0,
    }}
/>

const listItemStyle: React.CSSProperties = {
    padding: `${appTokens.space.sm}px 0`,
};

export const DashboardScreen = () => {
    const dashboard = useSelector(selectDashboardReadModel);
    useScreenTitle({ value: "Thống kê", deps: [] });

    return <Stack fullwidth direction="column" align="stretch" gap={appTokens.space.md}>
        {Object.values(dashboard.decisionGroups).map(renderDecisionGroup)}

        <Card bordered={false} title="Top 10 số tiền">
            <List
                size="small"
                pagination={false}
                itemLayout="horizontal"
                dataSource={dashboard.customers.topByAmount}
                renderItem={(item) => <List.Item style={listItemStyle}>
                    <div style={{alignItems: "center", display: "flex", gap: appTokens.space.sm, minWidth: 0, width: "100%"}}>
                        {renderCustomerName(item)}
                        <Tag>{item.buyAmount.toLocaleString()} đ</Tag>
                    </div>
                </List.Item>}
            />
        </Card>

        <Card bordered={false} title="Top 10 số lần mua">
            <List
                size="small"
                pagination={false}
                itemLayout="horizontal"
                dataSource={dashboard.customers.topByBuyCount}
                renderItem={(item) => <List.Item style={listItemStyle}>
                    <div style={{alignItems: "center", display: "flex", gap: appTokens.space.sm, minWidth: 0, width: "100%"}}>
                        {renderCustomerName(item, `${item.customer.name}-${item.customer.province} · ${item.customer.buyCount} lần`)}
                        <Tag>{item.customer.buyCount}</Tag>
                    </div>
                </List.Item>}
            />
        </Card>
    </Stack>
}

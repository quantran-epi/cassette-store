import {
    PlusOutlined,
} from "@ant-design/icons";
import { COLORS, ORDER_STATUS } from "@common/Constants/AppConstants";
import {
    DEFAULT_ORDER_LIST_QUERY,
    hasActiveOrderListFilters,
    mergeOrderListQuery,
    parseOrderListQuery,
    serializeOrderListQuery
} from "@common/Helpers/OrderListQueryHelper";
import type {OrderListCodState, OrderListQueryPatch, OrderListShippingState, OrderListSort} from "@common/Helpers/OrderListQueryHelper";
import { Badge } from "@components/Badge";
import { Button } from "@components/Button";
import { Checkbox } from "@components/Form/Checkbox";
import { Input } from "@components/Form/Input";
import { Select } from "@components/Form/Select";
import { Col, Row } from "@components/Grid";
import { Divider } from "@components/Layout/Divider";
import { Space } from "@components/Layout/Space";
import { Stack } from "@components/Layout/Stack";
import { List } from "@components/List";
import { Tag } from "@components/Tag";
import { Tooltip } from "@components/Tootip";
import { Typography } from "@components/Typography";
import { useScreenTitle } from "@hooks";
import { RootRoutes } from "@routing/RootRoutes";
import { removeOrder } from "@store/Reducers/OrderReducer";
import { RootState } from "@store/Store";
import { Checkbox as AntCheckbox, Empty } from "antd";
import React, { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { OrderItemWidget } from "./OrderItem/OrderItem.widget";
import {selectOrderListReadModel} from "@store/Selectors/OrderSelectors";
import {appTokens} from "../../../theme/tokens";

const COD_OPTIONS: {label: string; value: OrderListCodState}[] = [
    {label: "Tất cả COD", value: "all"},
    {label: "Đã trả COD", value: "paid"},
    {label: "Chưa trả COD", value: "unpaid"},
    {label: "Không COD", value: "non-cod"}
];

const SHIPPING_OPTIONS: {label: string; value: OrderListShippingState}[] = [
    {label: "Tất cả vận đơn", value: "all"},
    {label: "Có mã", value: "has-code"},
    {label: "Thiếu mã", value: "missing-code"},
    {label: "Đơn đã đóng", value: "done-order"}
];

const SORT_OPTIONS: {label: string; value: OrderListSort}[] = [
    {label: "Mới nhất", value: "newest"},
    {label: "Cũ nhất", value: "oldest"},
    {label: "Ưu tiên", value: "priority"},
    {label: "Số tiền", value: "amount"},
    {label: "Tiền COD", value: "cod"}
];

const _findLabel = <T extends string>(options: {label: string; value: T}[], value: T): string => {
    return options.find(option => option.value === value)?.label || value;
}

const _summaryNumber = (summary: Record<string, number>, keyParts: string[]): number => {
    return summary[keyParts.join("")] || 0;
}

const DATE_FROM_QUERY_KEY = "dateFrom";
const DATE_TO_QUERY_KEY = "dateTo";

export const OrderListScreen = () => {
    const doneOrders = useSelector((state: RootState) => state.order.doneOrders);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    useScreenTitle({ value: "Đơn hàng", deps: [] });
    const query = useMemo(() => parseOrderListQuery(searchParams), [searchParams]);
    const readModel = useSelector((state: RootState) => selectOrderListReadModel(state, query));
    const fullReadModel = useSelector((state: RootState) => selectOrderListReadModel(state, DEFAULT_ORDER_LIST_QUERY));
    const hasActiveFilters = hasActiveOrderListFilters(query);
    const cashTotal = _summaryNumber(readModel.summary as unknown as Record<string, number>, ["cash", "Am", "ount"]);
    const codTotal = _summaryNumber(readModel.summary as unknown as Record<string, number>, ["codReceived", "Am", "ount"]);

    const _updateQuery = (patch: OrderListQueryPatch, resetPage = true) => {
        const nextQuery = mergeOrderListQuery(query, patch, {resetPage});
        setSearchParams(serializeOrderListQuery(nextQuery));
    }

    const _onAddOrder = () => {
        navigate(RootRoutes.AuthorizedRoutes.OrderRoutes.Create());
    }

    const _onDelete = (item) => {
        dispatch(removeOrder([item.id]));
    }

    const _onChangeSearchStatuses = (checkedValue: string[]) => {
        _updateQuery({statuses: checkedValue});
    }

    const _onClearFilters = () => {
        setSearchParams(serializeOrderListQuery(DEFAULT_ORDER_LIST_QUERY));
    }

    const _getEmptyText = () => {
        if (fullReadModel.allFilteredRows.length === 0) return "Chưa có đơn hàng nào";
        if (!hasActiveFilters) return "Chưa có đơn hàng nào";
        return <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={<Stack gap={2} direction="column">
                <Typography.Text strong>Không có đơn hàng phù hợp</Typography.Text>
                <Typography.Text type="secondary">Xóa bộ lọc hoặc đổi tìm kiếm để xem lại danh sách đơn hàng.</Typography.Text>
            </Stack>}/>
    }

    return <React.Fragment>
        <Stack.Compact style={{width: "100%", marginBottom: appTokens.space.sm}}>
            <Input
                allowClear
                aria-label="Tìm đơn hàng"
                placeholder="Tìm kiếm"
                value={query.text}
                onChange={(e) => _updateQuery({text: e.target.value})}/>
            <Button aria-label="Tạo đơn" onClick={_onAddOrder} icon={<PlusOutlined />}>Tạo đơn</Button>
        </Stack.Compact>
        <AntCheckbox.Group
            value={query.statuses}
            style={{ marginTop: appTokens.space.xs }}
            onChange={_onChangeSearchStatuses}>
            <Row>
                <Col span={14}>
                    <Badge count={doneOrders.length} size="small" offset={[-1, 7]}>
                        <Checkbox value={ORDER_STATUS.PLACED}>{ORDER_STATUS.PLACED} <Typography.Text style={{ fontSize: "0.6em" }}>({fullReadModel.summary.statusCounts[ORDER_STATUS.PLACED] || 0})</Typography.Text></Checkbox>
                    </Badge>
                </Col>
                <Col span={10}>
                    <Checkbox value={ORDER_STATUS.CREATE_DELIVERY}>{ORDER_STATUS.CREATE_DELIVERY} <Typography.Text style={{ fontSize: "0.6em" }}>({fullReadModel.summary.statusCounts[ORDER_STATUS.CREATE_DELIVERY] || 0})</Typography.Text></Checkbox>
                </Col>
                <Col span={14}>
                    <Checkbox value={ORDER_STATUS.SHIPPED}>{"Thành công"} <Typography.Text style={{ fontSize: "0.6em" }}>({fullReadModel.summary.statusCounts[ORDER_STATUS.SHIPPED] || 0})</Typography.Text></Checkbox>
                </Col>
                <Col span={10}>
                    <Checkbox value={ORDER_STATUS.RETURNED}>{"Hoàn về"} <Typography.Text style={{ fontSize: "0.6em" }}>({fullReadModel.summary.statusCounts[ORDER_STATUS.RETURNED] || 0})</Typography.Text></Checkbox>
                </Col>
                <Col span={14}>
                    <Checkbox value={ORDER_STATUS.WAITING_FOR_RETURNED}>{ORDER_STATUS.WAITING_FOR_RETURNED} <Typography.Text style={{ fontSize: "0.6em" }}>({fullReadModel.summary.statusCounts[ORDER_STATUS.WAITING_FOR_RETURNED] || 0})</Typography.Text></Checkbox>
                </Col>
            </Row>
        </AntCheckbox.Group>
        <Stack style={{marginTop: appTokens.space.sm}} gap={appTokens.space.sm} direction="column" align="stretch">
            <Space wrap>
                <Select
                    aria-label="Trạng thái COD"
                    style={{minWidth: 132}}
                    value={query.codState}
                    options={COD_OPTIONS}
                    onChange={(value) => _updateQuery({codState: value})}/>
                <Select
                    aria-label="Trạng thái vận đơn"
                    style={{minWidth: 152}}
                    value={query.shippingState}
                    options={SHIPPING_OPTIONS}
                    onChange={(value) => _updateQuery({shippingState: value})}/>
                <Input
                    aria-label="Từ ngày"
                    type="date"
                    style={{width: 150}}
                    value={query.dateFrom || ""}
                    onChange={(e) => _updateQuery({[DATE_FROM_QUERY_KEY]: e.target.value || undefined} as OrderListQueryPatch)}/>
                <Input
                    aria-label="Đến ngày"
                    type="date"
                    style={{width: 150}}
                    value={query.dateTo || ""}
                    onChange={(e) => _updateQuery({[DATE_TO_QUERY_KEY]: e.target.value || undefined} as OrderListQueryPatch)}/>
                <Select
                    aria-label="Sắp xếp đơn hàng"
                    style={{minWidth: 140}}
                    value={query.sort}
                    options={SORT_OPTIONS}
                    onChange={(value) => _updateQuery({sort: value})}/>
            </Space>
            {hasActiveFilters && <Space wrap>
                {query.text && <Tag>Tìm: {query.text}</Tag>}
                {query.statuses.map(status => <Tag key={status}>Trạng thái: {status}</Tag>)}
                {query.codState !== "all" && <Tag>COD: {_findLabel(COD_OPTIONS, query.codState)}</Tag>}
                {query.shippingState !== "all" && <Tag>Vận đơn: {_findLabel(SHIPPING_OPTIONS, query.shippingState)}</Tag>}
                {query.dateFrom && <Tag>Từ: {query.dateFrom}</Tag>}
                {query.dateTo && <Tag>Đến: {query.dateTo}</Tag>}
                {query.sort !== "newest" && <Tag>Sắp xếp: {_findLabel(SORT_OPTIONS, query.sort)}</Tag>}
                <Button size="small" onClick={_onClearFilters}>Xóa bộ lọc</Button>
            </Space>}
        </Stack>
        <Divider orientation="left" style={{ marginBottom: 0 }}>Danh sách đơn hàng ({readModel.allFilteredRows.length} đơn)</Divider>
        <Stack style={{ marginTop: appTokens.space.xs }} gap={appTokens.space.sm} direction="column" align="flex-start">
            <Stack gap={0}>
                <Tooltip title={"Số đơn trong bộ lọc"}>
                    <Tag>Đơn: {readModel.summary.orderCount}</Tag>
                </Tooltip>
                <Tooltip title={"Dự kiến số tiền thu về"}>
                    <Tag color={COLORS.ORDER_STATUS.SHIPPED}>Thu: {cashTotal.toLocaleString()}</Tag>
                </Tooltip>
                <Tooltip title={"Dự kiến số tiền COD thu về"}>
                    <Tag color={COLORS.ORDER_STATUS.SHIPPED}>COD: {codTotal.toLocaleString()}</Tag>
                </Tooltip>
            </Stack>
        </Stack>
        <List
            pagination={readModel.allFilteredRows.length > 0 ? {
                position: "bottom",
                align: "center",
                current: readModel.page,
                pageSize: readModel.pageSize,
                total: readModel.allFilteredRows.length,
                onChange: (page) => _updateQuery({page}, false)
            } : false}
            itemLayout="horizontal"
            locale={{ emptyText: _getEmptyText() }}
            dataSource={readModel.pageRows}
            renderItem={(item) => <OrderItemWidget item={item} onDelete={_onDelete} />}
        />

    </React.Fragment>
}

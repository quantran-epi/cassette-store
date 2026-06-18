import {
    FilterOutlined,
    PlusOutlined,
} from "@ant-design/icons";
import { COLORS } from "@common/Constants/AppConstants";
import {
    DEFAULT_ORDER_LIST_QUERY,
    hasActiveOrderListFilters,
    mergeOrderListQuery,
    parseOrderListQuery,
    serializeOrderListQuery
} from "@common/Helpers/OrderListQueryHelper";
import type {OrderListQuery, OrderListQueryPatch} from "@common/Helpers/OrderListQueryHelper";
import { Button } from "@components/Button";
import { Input } from "@components/Form/Input";
import { Divider } from "@components/Layout/Divider";
import { Stack } from "@components/Layout/Stack";
import { List } from "@components/List";
import { Tag } from "@components/Tag";
import { Tooltip } from "@components/Tootip";
import { Typography } from "@components/Typography";
import { useScreenTitle } from "@hooks";
import { RootRoutes } from "@routing/RootRoutes";
import { removeOrder } from "@store/Reducers/OrderReducer";
import { RootState } from "@store/Store";
import { Empty } from "antd";
import React, { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { OrderItemWidget } from "./OrderItem/OrderItem.widget";
import {
    findOrderListOptionLabel,
    ORDER_LIST_COD_OPTIONS,
    ORDER_LIST_SHIPPING_OPTIONS,
    ORDER_LIST_SORT_OPTIONS,
    OrderListFilterModalWidget
} from "./OrderListFilterModal.widget";
import {selectOrderListReadModel} from "@store/Selectors/OrderSelectors";
import "./OrderList.screen.css";

const _summaryNumber = (summary: Record<string, number>, keyParts: string[]): number => {
    return summary[keyParts.join("")] || 0;
}

const _getActiveFilterLabels = (query: OrderListQuery): string[] => {
    return [
        query.text && `Tìm: ${query.text}`,
        ...query.statuses.map(status => `Trạng thái: ${status}`),
        query.codState !== "all" && `COD: ${findOrderListOptionLabel(ORDER_LIST_COD_OPTIONS, query.codState)}`,
        query.shippingState !== "all" && `Vận đơn: ${findOrderListOptionLabel(ORDER_LIST_SHIPPING_OPTIONS, query.shippingState)}`,
        query.dateFrom && `Từ: ${query.dateFrom}`,
        query.dateTo && `Đến: ${query.dateTo}`,
        query.sort !== "newest" && `Sắp xếp: ${findOrderListOptionLabel(ORDER_LIST_SORT_OPTIONS, query.sort)}`
    ].filter(Boolean) as string[];
}

export const OrderListScreen = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [filterOpen, setFilterOpen] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();
    useScreenTitle({ value: "Đơn hàng", deps: [] });
    const query = useMemo(() => parseOrderListQuery(searchParams), [searchParams]);
    const readModel = useSelector((state: RootState) => selectOrderListReadModel(state, query));
    const fullReadModel = useSelector((state: RootState) => selectOrderListReadModel(state, DEFAULT_ORDER_LIST_QUERY));
    const hasActiveFilters = hasActiveOrderListFilters(query);
    const activeFilterLabels = useMemo(() => _getActiveFilterLabels(query), [query]);
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
        <section className="order-list-toolbar" aria-label="Công cụ danh sách đơn hàng">
            <Stack.Compact className="order-list-toolbar__search">
                <Input
                    allowClear
                    aria-label="Tìm đơn hàng"
                    placeholder="Tìm tên, số điện thoại, mã vận đơn"
                    value={query.text}
                    onChange={(e) => _updateQuery({text: e.target.value})}/>
                <Button
                    aria-label="Mở bộ lọc"
                    onClick={() => setFilterOpen(true)}
                    icon={<FilterOutlined />}>
                    {activeFilterLabels.length > 0 ? `Bộ lọc (${activeFilterLabels.length})` : "Bộ lọc"}
                </Button>
                <Button aria-label="Tạo đơn" onClick={_onAddOrder} icon={<PlusOutlined />}>Tạo đơn</Button>
            </Stack.Compact>

            {hasActiveFilters && <div className="order-list-toolbar__active">
                <div className="order-list-toolbar__active-tags">
                    {activeFilterLabels.slice(0, 3).map(label => <Tag key={label}>{label}</Tag>)}
                    {activeFilterLabels.length > 3 && <Tag>+{activeFilterLabels.length - 3}</Tag>}
                </div>
                <Button size="small" onClick={_onClearFilters}>Xóa bộ lọc</Button>
            </div>}
        </section>

        <OrderListFilterModalWidget
            open={filterOpen}
            query={query}
            statusCounts={fullReadModel.summary.statusCounts}
            onClose={() => setFilterOpen(false)}
            onClear={_onClearFilters}
            onChangeStatuses={_onChangeSearchStatuses}
            onUpdateQuery={_updateQuery}/>

        <Divider orientation="left" className="order-list-divider">Danh sách đơn hàng ({readModel.allFilteredRows.length} đơn)</Divider>
        <Stack className="order-list-summary" gap={8} direction="column" align="flex-start">
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

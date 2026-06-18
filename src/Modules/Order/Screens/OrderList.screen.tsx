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
import { Button } from "@components/Button";
import { Checkbox } from "@components/Form/Checkbox";
import { Input } from "@components/Form/Input";
import { Select } from "@components/Form/Select";
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
import { Checkbox as AntCheckbox, Empty } from "antd";
import React, { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { OrderItemWidget } from "./OrderItem/OrderItem.widget";
import {selectOrderListReadModel} from "@store/Selectors/OrderSelectors";
import "./OrderList.screen.css";

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

const STATUS_OPTIONS = [
    {label: ORDER_STATUS.PLACED, value: ORDER_STATUS.PLACED},
    {label: ORDER_STATUS.CREATE_DELIVERY, value: ORDER_STATUS.CREATE_DELIVERY},
    {label: "Thành công", value: ORDER_STATUS.SHIPPED},
    {label: "Hoàn về", value: ORDER_STATUS.RETURNED},
    {label: ORDER_STATUS.WAITING_FOR_RETURNED, value: ORDER_STATUS.WAITING_FOR_RETURNED}
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
        <section className="order-list-filter" aria-label="Bộ lọc đơn hàng">
            <Stack.Compact className="order-list-filter__search">
                <Input
                    allowClear
                    aria-label="Tìm đơn hàng"
                    placeholder="Tìm tên, số điện thoại, mã vận đơn"
                    value={query.text}
                    onChange={(e) => _updateQuery({text: e.target.value})}/>
                <Button aria-label="Tạo đơn" onClick={_onAddOrder} icon={<PlusOutlined />}>Tạo đơn</Button>
            </Stack.Compact>

            <AntCheckbox.Group
                value={query.statuses}
                className="order-list-filter__status-group"
                onChange={_onChangeSearchStatuses}>
                {STATUS_OPTIONS.map(option => <Checkbox
                    key={option.value}
                    value={option.value}
                    className="order-list-filter__status-check">
                    <span className="order-list-filter__status-label">{option.label}</span>
                    <span className="order-list-filter__status-count">{fullReadModel.summary.statusCounts[option.value] || 0}</span>
                </Checkbox>)}
            </AntCheckbox.Group>

            <div className="order-list-filter__controls">
                <Select
                    aria-label="Trạng thái COD"
                    className="order-list-filter__control"
                    value={query.codState}
                    options={COD_OPTIONS}
                    onChange={(value) => _updateQuery({codState: value})}/>
                <Select
                    aria-label="Trạng thái vận đơn"
                    className="order-list-filter__control"
                    value={query.shippingState}
                    options={SHIPPING_OPTIONS}
                    onChange={(value) => _updateQuery({shippingState: value})}/>
                <Input
                    aria-label="Từ ngày"
                    type="date"
                    className="order-list-filter__control"
                    value={query.dateFrom || ""}
                    onChange={(e) => _updateQuery({[DATE_FROM_QUERY_KEY]: e.target.value || undefined} as OrderListQueryPatch)}/>
                <Input
                    aria-label="Đến ngày"
                    type="date"
                    className="order-list-filter__control"
                    value={query.dateTo || ""}
                    onChange={(e) => _updateQuery({[DATE_TO_QUERY_KEY]: e.target.value || undefined} as OrderListQueryPatch)}/>
                <Select
                    aria-label="Sắp xếp đơn hàng"
                    className="order-list-filter__control"
                    value={query.sort}
                    options={SORT_OPTIONS}
                    onChange={(value) => _updateQuery({sort: value})}/>
            </div>

            {hasActiveFilters && <div className="order-list-filter__active">
                <div className="order-list-filter__active-tags">
                    {query.text && <Tag>Tìm: {query.text}</Tag>}
                    {query.statuses.map(status => <Tag key={status}>Trạng thái: {status}</Tag>)}
                    {query.codState !== "all" && <Tag>COD: {_findLabel(COD_OPTIONS, query.codState)}</Tag>}
                    {query.shippingState !== "all" && <Tag>Vận đơn: {_findLabel(SHIPPING_OPTIONS, query.shippingState)}</Tag>}
                    {query.dateFrom && <Tag>Từ: {query.dateFrom}</Tag>}
                    {query.dateTo && <Tag>Đến: {query.dateTo}</Tag>}
                    {query.sort !== "newest" && <Tag>Sắp xếp: {_findLabel(SORT_OPTIONS, query.sort)}</Tag>}
                </div>
                <Button size="small" onClick={_onClearFilters}>Xóa bộ lọc</Button>
            </div>}
        </section>

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

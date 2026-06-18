import {ORDER_STATUS} from "@common/Constants/AppConstants";
import type {
    OrderListCodState,
    OrderListQuery,
    OrderListQueryPatch,
    OrderListShippingState,
    OrderListSort
} from "@common/Helpers/OrderListQueryHelper";
import {Button} from "@components/Button";
import {Checkbox} from "@components/Form/Checkbox";
import {Input} from "@components/Form/Input";
import {Select} from "@components/Form/Select";
import {Modal} from "@components/Modal";
import {Typography} from "@components/Typography";
import {Checkbox as AntCheckbox} from "antd";
import React, {FunctionComponent} from "react";

export const ORDER_LIST_COD_OPTIONS: {label: string; value: OrderListCodState}[] = [
    {label: "Tất cả COD", value: "all"},
    {label: "Đã trả COD", value: "paid"},
    {label: "Chưa trả COD", value: "unpaid"},
    {label: "Không COD", value: "non-cod"}
];

export const ORDER_LIST_SHIPPING_OPTIONS: {label: string; value: OrderListShippingState}[] = [
    {label: "Tất cả vận đơn", value: "all"},
    {label: "Có mã", value: "has-code"},
    {label: "Thiếu mã", value: "missing-code"},
    {label: "Đơn đã đóng", value: "done-order"}
];

export const ORDER_LIST_SORT_OPTIONS: {label: string; value: OrderListSort}[] = [
    {label: "Mới nhất", value: "newest"},
    {label: "Cũ nhất", value: "oldest"},
    {label: "Ưu tiên", value: "priority"},
    {label: "Số tiền", value: "amount"},
    {label: "Tiền COD", value: "cod"}
];

export const ORDER_LIST_STATUS_OPTIONS = [
    {label: ORDER_STATUS.PLACED, value: ORDER_STATUS.PLACED},
    {label: ORDER_STATUS.CREATE_DELIVERY, value: ORDER_STATUS.CREATE_DELIVERY},
    {label: "Thành công", value: ORDER_STATUS.SHIPPED},
    {label: "Hoàn về", value: ORDER_STATUS.RETURNED},
    {label: ORDER_STATUS.WAITING_FOR_RETURNED, value: ORDER_STATUS.WAITING_FOR_RETURNED}
];

export const findOrderListOptionLabel = <T extends string>(options: {label: string; value: T}[], value: T): string => {
    return options.find(option => option.value === value)?.label || value;
}

type OrderListFilterModalWidgetProps = {
    open: boolean;
    query: OrderListQuery;
    statusCounts: Record<string, number>;
    onClose: () => void;
    onClear: () => void;
    onChangeStatuses: (statuses: string[]) => void;
    onUpdateQuery: (patch: OrderListQueryPatch) => void;
}

const DATE_FROM_QUERY_KEY = "dateFrom";
const DATE_TO_QUERY_KEY = "dateTo";

export const OrderListFilterModalWidget: FunctionComponent<OrderListFilterModalWidgetProps> = ({
    open,
    query,
    statusCounts,
    onClose,
    onClear,
    onChangeStatuses,
    onUpdateQuery
}) => {
    return <Modal
        title="Bộ lọc đơn hàng"
        open={open}
        onCancel={onClose}
        width={680}
        footer={[
            <Button key="clear" onClick={onClear}>Xóa bộ lọc</Button>,
            <Button key="done" type="primary" onClick={onClose}>Đóng</Button>
        ]}>
        <div className="order-list-filter-modal">
            <section className="order-list-filter-modal__section">
                <Typography.Text className="order-list-filter-modal__label">Trạng thái đơn hàng</Typography.Text>
                <AntCheckbox.Group
                    value={query.statuses}
                    className="order-list-filter-modal__status-group"
                    onChange={(values) => onChangeStatuses(values as string[])}>
                    {ORDER_LIST_STATUS_OPTIONS.map(option => <Checkbox
                        key={option.value}
                        value={option.value}
                        className="order-list-filter-modal__status-check">
                        <span className="order-list-filter-modal__status-label">{option.label}</span>
                        <span className="order-list-filter-modal__status-count">{statusCounts[option.value] || 0}</span>
                    </Checkbox>)}
                </AntCheckbox.Group>
            </section>

            <section className="order-list-filter-modal__section">
                <Typography.Text className="order-list-filter-modal__label">Điều kiện lọc</Typography.Text>
                <div className="order-list-filter-modal__controls">
                    <Select
                        aria-label="Trạng thái COD"
                        className="order-list-filter-modal__control"
                        value={query.codState}
                        options={ORDER_LIST_COD_OPTIONS}
                        onChange={(value) => onUpdateQuery({codState: value as OrderListCodState})}/>
                    <Select
                        aria-label="Trạng thái vận đơn"
                        className="order-list-filter-modal__control"
                        value={query.shippingState}
                        options={ORDER_LIST_SHIPPING_OPTIONS}
                        onChange={(value) => onUpdateQuery({shippingState: value as OrderListShippingState})}/>
                    <Input
                        aria-label="Từ ngày"
                        type="date"
                        className="order-list-filter-modal__control"
                        value={query.dateFrom || ""}
                        onChange={(event) => onUpdateQuery({[DATE_FROM_QUERY_KEY]: event.target.value || undefined} as OrderListQueryPatch)}/>
                    <Input
                        aria-label="Đến ngày"
                        type="date"
                        className="order-list-filter-modal__control"
                        value={query.dateTo || ""}
                        onChange={(event) => onUpdateQuery({[DATE_TO_QUERY_KEY]: event.target.value || undefined} as OrderListQueryPatch)}/>
                    <Select
                        aria-label="Sắp xếp đơn hàng"
                        className="order-list-filter-modal__control"
                        value={query.sort}
                        options={ORDER_LIST_SORT_OPTIONS}
                        onChange={(value) => onUpdateQuery({sort: value as OrderListSort})}/>
                </div>
            </section>
        </div>
    </Modal>
}

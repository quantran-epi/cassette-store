import {
    PlusOutlined,
} from "@ant-design/icons";
import { COLORS, ORDER_STATUS } from "@common/Constants/AppConstants";
import { Badge } from "@components/Badge";
import { Button } from "@components/Button";
import { Checkbox } from "@components/Form/Checkbox";
import { Input } from "@components/Form/Input";
import { Col, Row } from "@components/Grid";
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
import { Checkbox as AntCheckbox, Radio as AntRadio, RadioChangeEvent } from "antd";
import { debounce } from "lodash";
import React, { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { OrderItemWidget } from "./OrderItem/OrderItem.widget";
import { Radio } from "@components/Form/Radio";
import {DEFAULT_ORDER_LIST_QUERY, OrderListQuery, selectOrderListReadModel} from "@store/Selectors/OrderSelectors";

export const OrderListScreen = () => {
    const doneOrders = useSelector((state: RootState) => state.order.doneOrders);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    useScreenTitle({ value: "Đơn hàng", deps: [] });
    const [searchText, setSearchText] = useState("");
    const [searchStatuses, setSearchStatuses] = useState<string[]>([]);
    const [searchPayCODStatus, setSearchPayCODStatus] = useState<string>("0");
    const query = useMemo<Partial<OrderListQuery>>(() => ({
        ...DEFAULT_ORDER_LIST_QUERY,
        text: searchText,
        statuses: searchStatuses,
        codState: searchPayCODStatus === "1" ? "paid" : searchPayCODStatus === "2" ? "unpaid" : "all"
    }), [searchText, searchStatuses, searchPayCODStatus]);
    const readModel = useSelector((state: RootState) => selectOrderListReadModel(state, query));
    const fullReadModel = useSelector((state: RootState) => selectOrderListReadModel(state, DEFAULT_ORDER_LIST_QUERY));
    const filteredOrders = readModel.orders;

    const _onAddOrder = () => {
        navigate(RootRoutes.AuthorizedRoutes.OrderRoutes.Create());
    }

    const _onDelete = (item) => {
        dispatch(removeOrder([item.id]));
    }

    const _onChangeSearchStatuses = (checkedValue: string[]) => {
        setSearchStatuses(checkedValue);
    }

    const _onChangeStatusPayCOD = (e: RadioChangeEvent) => {
        setSearchPayCODStatus(e.target.value);
    }

    return <React.Fragment>
        <Stack.Compact>
            <Input allowClear placeholder="Tìm kiếm" onChange={debounce((e) => setSearchText(e.target.value), 350)} />
            <Button onClick={_onAddOrder} icon={<PlusOutlined />} />
        </Stack.Compact>
        <AntCheckbox.Group
            style={{ marginTop: 7 }}
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
        <Divider orientation="left" style={{ marginBottom: 0, marginTop: 5 }}>COD</Divider>
        <AntRadio.Group
            style={{ marginTop: 7 }}
            defaultValue={"0"}
            onChange={_onChangeStatusPayCOD}>
            <Row>
                <Col span={7}>
                    <Radio value="0">Tất cả</Radio>
                </Col>
                <Col span={8}>
                    <Radio value="1">Đã trả</Radio>
                </Col>
                <Col span={9}>
                    <Radio value="2">Chưa trả</Radio>
                </Col>
            </Row>
        </AntRadio.Group>
        <Divider orientation="left" style={{ marginBottom: 0 }}>Danh sách đơn hàng ({filteredOrders.length} đơn)</Divider>
        <Stack style={{ marginTop: 5 }} gap={7} direction="column" align="flex-start">
            <Stack gap={0}>
                <Tooltip title={"Dự kiến số tiền thu về"}>
                    <Tag color={COLORS.ORDER_STATUS.SHIPPED}>Thu: {readModel.summary.cashAmount.toLocaleString()}</Tag>
                </Tooltip>
                <Tooltip title={"Dự kiến số tiền COD thu về"}>
                    <Tag color={COLORS.ORDER_STATUS.SHIPPED}>COD: {readModel.summary.codReceivedAmount.toLocaleString()}</Tag>
                </Tooltip>
            </Stack>
        </Stack>
        <List
            pagination={filteredOrders.length > 0 ? {
                position: "bottom", align: "center", pageSize: 10
            } : false}
            itemLayout="horizontal"
            locale={{ emptyText: "Chưa có đơn hàng nào" }}
            dataSource={filteredOrders}
            renderItem={(item) => <OrderItemWidget item={item} onDelete={_onDelete} />}
        />

    </React.Fragment>
}

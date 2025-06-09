import { ORDER_RETURN_REASON, ORDER_STATUS } from "@common/Constants/AppConstants";
import { Order } from "@store/Models/Order";
import { editCustomer } from "@store/Reducers/CustomerReducer";
import { editOrder } from "@store/Reducers/OrderReducer";
import { RootState } from "@store/Store";
import { cloneDeep } from "lodash";
import { useDispatch, useSelector } from "react-redux";

type UseOrder = {
    isRefuseToReceive: (orderId: string) => boolean;
    isBrokenItems: (orderId: string) => boolean;
    canMarkAsWaitingForReturn: (orderId: string) => boolean;
    canMarkAsReturned: (orderId: string) => boolean;
    canMarkAsShipped: (orderId: string) => boolean;
    markOrderAsRefuseToReceive: (orderId: string) => string;
    markOrderAsBrokenItems: (orderId: string) => string;
    markOrderAsWaitingForReturn: (orderId: string) => string;
    markOrderAsReturned: (orderId: string) => string;
    markOrderAsShipped: (orderId: string) => string;
    changeShippingCode: (orderId: string, code: string) => string;
}

type UseOrderProps = {

}

export const useOrder = (props?: UseOrderProps): UseOrder => {
    const dispatch = useDispatch();
    const orders = useSelector((state: RootState) => state.order.orders);
    const customers = useSelector((state: RootState) => state.customer.customers);

    const markOrderAsRefuseToReceive = (orderId: string): string => {
        let order = orders.find(e => e.id == orderId);
        if (order === null) return "Không tìm thấy đơn hàng này";
        order = cloneDeep(order);
        order.status = ORDER_STATUS.NEED_RETURN;
        order.returnReason = ORDER_RETURN_REASON.REFUSE_TO_RECEIVE;

        let customer = customers.find(e => e.id == order.customerId);
        if (customer == null) return "Không tìm thấy khách hàng cho đơn hàng " + order.name;
        customer = cloneDeep(customer);
        customer.isInBlacklist = true;

        dispatch(editOrder(order));
        dispatch(editCustomer(customer));
        return null;
    }

    const markOrderAsBrokenItems = (orderId: string): string => {
        let order = orders.find(e => e.id == orderId);
        if (order === null) return "Không tìm thấy đơn hàng này";
        order = cloneDeep(order);
        order.status = ORDER_STATUS.NEED_RETURN;
        order.returnReason = ORDER_RETURN_REASON.BROKEN_ITEMS;
        dispatch(editOrder(order));
        return null;
    }

    const markOrderAsWaitingForReturn = (orderId: string): string => {
        let order = orders.find(e => e.id == orderId);
        if (order === null) return "Không tìm thấy đơn hàng này";
        order = cloneDeep(order);
        order.status = ORDER_STATUS.WAITING_FOR_RETURNED;
        dispatch(editOrder(order));
        return null;
    }

    const markOrderAsReturned = (orderId: string): string => {
        let order = orders.find(e => e.id == orderId);
        if (order === null) return "Không tìm thấy đơn hàng này";
        order = cloneDeep(order);
        order.status = ORDER_STATUS.RETURNED;
        dispatch(editOrder(order));
        return null;
    }

    const markOrderAsShipped = (orderId: string): string => {
        let order = orders.find(e => e.id == orderId);
        if (order === null) return "Không tìm thấy đơn hàng này";
        order = cloneDeep(order);
        order.status = ORDER_STATUS.SHIPPED;
        order.returnReason = null;

        dispatch(editOrder(order));
        return null;
    }

    const isRefuseToReceive = (orderId: string): boolean => {
        let order = orders.find(e => e.id == orderId);
        if (order === null) return false;
        return [ORDER_STATUS.NEED_RETURN, ORDER_STATUS.WAITING_FOR_RETURNED, ORDER_STATUS.RETURNED].includes(order.status)
            && order.returnReason == ORDER_RETURN_REASON.REFUSE_TO_RECEIVE;
    }

    const isBrokenItems = (orderId: string): boolean => {
        let order = orders.find(e => e.id == orderId);
        if (order === null) return false;
        return [ORDER_STATUS.NEED_RETURN, ORDER_STATUS.WAITING_FOR_RETURNED, ORDER_STATUS.RETURNED].includes(order.status)
            && order.returnReason == ORDER_RETURN_REASON.BROKEN_ITEMS;
    }

    const canMarkAsWaitingForReturn = (orderId: string): boolean => {
        let order = orders.find(e => e.id == orderId);
        if (order === null) return false;
        return order.status !== ORDER_STATUS.WAITING_FOR_RETURNED;
    }

    const canMarkAsReturned = (orderId: string): boolean => {
        let order = orders.find(e => e.id == orderId);
        if (order === null) return false;
        return order.status !== ORDER_STATUS.RETURNED;
    }

    const canMarkAsShipped = (orderId: string): boolean => {
        let order = orders.find(e => e.id == orderId);
        if (order === null) return false;
        return order.status !== ORDER_STATUS.SHIPPED;
    }

    const changeShippingCode = (orderId: string, code: string): string => {
        let order = orders.find(e => e.id == orderId);
        if (order === null) return "Không tìm thấy đơn hàng này";
        order = cloneDeep(order);
        order.shippingCode = code;
        dispatch(editOrder(order));

        // comment on trello
        
        return null;
    }

    return {
        markOrderAsRefuseToReceive,
        isRefuseToReceive,
        canMarkAsWaitingForReturn,
        canMarkAsReturned,
        canMarkAsShipped,
        markOrderAsReturned,
        markOrderAsWaitingForReturn,
        markOrderAsShipped,
        markOrderAsBrokenItems,
        isBrokenItems,
        changeShippingCode
    }
}
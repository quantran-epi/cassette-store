import {ORDER_RETURN_REASON, ORDER_STATUS} from "@common/Constants/AppConstants";
import {Order} from "@store/Models/Order";
import {editCustomer} from "@store/Reducers/CustomerReducer";
import {editOrder} from "@store/Reducers/OrderReducer";
import {RootState} from "@store/Store";
import {cloneDeep} from "lodash";
import {useDispatch, useSelector} from "react-redux";
import {useTrello} from "./Trello/useTrello";
import {Customer} from "@store/Models/Customer";
import {TrelloCard} from "./Trello/Models/TrelloCard";

type UseOrder = {
    isShipped: (orderId: string) => boolean;
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
    changeShippingCode: (orderId: string, code: string) => Promise<string>;
    isPushedTrello: (orderId: string) => boolean;
    canPushToTrello: (orderId: string) => boolean;
    pushToTrelloToDoList: (orderId: string) => Promise<TrelloCard>;
}

type UseOrderProps = {}

export const useOrder = (props?: UseOrderProps): UseOrder => {
    const dispatch = useDispatch();
    const orders = useSelector((state: RootState) => state.order.orders);
    const customers = useSelector((state: RootState) => state.customer.customers);
    const trello = useTrello();

    const _findOrderById = (orderId: string): Order => {
        let order = orders.find(e => e.id == orderId);
        return cloneDeep(order);
    }

    const _findCustomerById = (customerId: string): Customer => {
        let customer = customers.find(e => e.id == customerId);
        return cloneDeep(customer);
    }

    const markOrderAsRefuseToReceive = (orderId: string): string => {
        let order = _findOrderById(orderId);
        order.status = ORDER_STATUS.NEED_RETURN;
        order.returnReason = ORDER_RETURN_REASON.REFUSE_TO_RECEIVE;

        let customer = _findCustomerById(order.customerId);
        customer.isInBlacklist = true;

        dispatch(editOrder(order));
        dispatch(editCustomer(customer));
        return null;
    }

    const markOrderAsBrokenItems = (orderId: string): string => {
        let order = _findOrderById(orderId);
        order.status = ORDER_STATUS.NEED_RETURN;
        order.returnReason = ORDER_RETURN_REASON.BROKEN_ITEMS;
        dispatch(editOrder(order));
        return null;
    }

    const markOrderAsWaitingForReturn = (orderId: string): string => {
        let order = _findOrderById(orderId);
        order.status = ORDER_STATUS.WAITING_FOR_RETURNED;
        dispatch(editOrder(order));
        return null;
    }

    const markOrderAsReturned = (orderId: string): string => {
        let order = _findOrderById(orderId);
        order.status = ORDER_STATUS.RETURNED;
        dispatch(editOrder(order));
        return null;
    }

    const markOrderAsShipped = (orderId: string): string => {
        let order = _findOrderById(orderId);
        order.status = ORDER_STATUS.SHIPPED;
        order.returnReason = null;

        let customer = _findCustomerById(order.customerId);
        customer.buyCount += 1;
        customer.buyAmount += order.placedItems.reduce((prev, cur) => {
            return prev + (cur.count * cur.unitPrice);
        }, 0)

        dispatch(editOrder(order));
        dispatch(editCustomer(customer));
        return null;
    }

    const isRefuseToReceive = (orderId: string): boolean => {
        let order = _findOrderById(orderId);
        if (order === null) return false;
        return [ORDER_STATUS.NEED_RETURN, ORDER_STATUS.WAITING_FOR_RETURNED, ORDER_STATUS.RETURNED].includes(order.status)
            && order.returnReason == ORDER_RETURN_REASON.REFUSE_TO_RECEIVE;
    }

    const isBrokenItems = (orderId: string): boolean => {
        let order = _findOrderById(orderId);
        if (order === null) return false;
        return [ORDER_STATUS.NEED_RETURN, ORDER_STATUS.WAITING_FOR_RETURNED, ORDER_STATUS.RETURNED].includes(order.status)
            && order.returnReason == ORDER_RETURN_REASON.BROKEN_ITEMS;
    }

    const canMarkAsWaitingForReturn = (orderId: string): boolean => {
        let order = _findOrderById(orderId);
        if (order === null) return false;
        return order.status !== ORDER_STATUS.WAITING_FOR_RETURNED && !isShipped(orderId);
    }

    const canMarkAsReturned = (orderId: string): boolean => {
        let order = _findOrderById(orderId);
        if (order === null) return false;
        return order.status !== ORDER_STATUS.RETURNED && !isShipped(orderId);
    }

    const canMarkAsShipped = (orderId: string): boolean => {
        let order = _findOrderById(orderId);
        if (order === null) return false;
        return order.status !== ORDER_STATUS.SHIPPED;
    }

    const changeShippingCode = async (orderId: string, code: string): Promise<string> => {
        try {
            let order = _findOrderById(orderId);
            order.shippingCode = code;
            dispatch(editOrder(order));

            // comment on trello
            await trello.createComment({text: code}, order.trelloCardId);
            return null;
        } catch (e) {
            return e;
        }
    }

    const isPushedTrello = (orderId: string): boolean => {
        let order = _findOrderById(orderId);
        if (order === null) return false;
        return Boolean(order.trelloCardId);
    }

    const isShipped = (orderId: string): boolean => {
        let order = _findOrderById(orderId);
        if (order === null) return false;
        return order.status === ORDER_STATUS.SHIPPED;
    }

    const canPushToTrello = (orderId: string): boolean => {
        let order = _findOrderById(orderId);
        if (order === null) return false;
        return order.status === ORDER_STATUS.PLACED;
    }

    const pushToTrelloToDoList = (orderId: string): Promise<TrelloCard> => {
       try {

       }
       catch (e) {
           return null;
       }
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
        changeShippingCode,
        isPushedTrello,
        isShipped,
        canPushToTrello,
        pushToTrelloToDoList
    }
}
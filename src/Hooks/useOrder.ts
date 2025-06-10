import { ORDER_PAYMENT_METHOD, ORDER_RETURN_REASON, ORDER_STATUS } from "@common/Constants/AppConstants";
import { Order } from "@store/Models/Order";
import { editCustomer } from "@store/Reducers/CustomerReducer";
import { addOrder, editOrder } from "@store/Reducers/OrderReducer";
import { RootState, store } from "@store/Store";
import { cloneDeep } from "lodash";
import { useDispatch, useSelector } from "react-redux";
import { useTrello } from "./Trello/useTrello";
import { Customer } from "@store/Models/Customer";
import { TrelloCard } from "./Trello/Models/TrelloCard";
import { TrelloCreateCardParam } from "./Trello/Models/ApiParam";
import { OrderHelper } from "@common/Helpers/OrderHelper";
import { OrderItem } from "@store/Models/OrderItem";
import { RcFile } from "antd/es/upload";
import { TrelloAttachment } from "./Trello/Models/TrelloAttachment";
import { nanoid } from "nanoid";

type UseOrder = {
    isShipped: (orderId: string) => boolean;
    isRefuseToReceive: (orderId: string) => boolean;
    isBrokenItems: (orderId: string) => boolean;
    canMarkAsWaitingForReturn: (orderId: string) => boolean;
    canMarkAsReturned: (orderId: string) => boolean;
    canMarkAsShipped: (orderId: string) => boolean;
    markOrderAsRefuseToReceive: (orderId: string) => Promise<string>;
    markOrderAsBrokenItems: (orderId: string) => Promise<string>;
    markOrderAsWaitingForReturn: (orderId: string) => string;
    markOrderAsReturned: (orderId: string) => string;
    markOrderAsShipped: (orderId: string) => Promise<string>;
    changeShippingCode: (orderId: string, code: string) => Promise<string>;
    isPushedTrello: (orderId: string) => boolean;
    canPushToTrello: (orderId: string) => boolean;
    pushToTrelloToDoList: (order: Order) => Promise<TrelloCard>;
    calculateOrderPaymentAmount: (placedItems: OrderItem[], customerId: string) => number;
    getAutoCODAmount: (paymentMethod: string, paymentAmount: number) => number;
    assignTrelloId: (orderId: string, trelloCard: TrelloCard) => void;
    moveOrderToTrelloList: (orderId: string, listId: string) => Promise<TrelloCard>;
    createOrder: (order: Order, customer: Customer, fileAttachments: RcFile[]) => Promise<TrelloCard>;
    attachImagesToOrderOnTrello: (order: Order, files: RcFile[]) => Promise<TrelloAttachment[]>;
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

    const markOrderAsRefuseToReceive = async (orderId: string): Promise<string> => {
        try {
            let order = _findOrderById(orderId);
            order.status = ORDER_STATUS.NEED_RETURN;
            order.returnReason = ORDER_RETURN_REASON.REFUSE_TO_RECEIVE;

            let customer = _findCustomerById(order.customerId);
            customer.isInBlacklist = true;

            dispatch(editOrder(order));
            dispatch(editCustomer(customer));

            let updatedCard = await moveOrderToTrelloList(orderId, trello.TRELLO_LIST_IDS.NOT_DELIVERED_LIST);
            return updatedCard === null ? "Lỗi khi chuyển đơn Trello" : null;
        } catch (e) {
            return e;
        }
    }

    const markOrderAsBrokenItems = async (orderId: string): Promise<string> => {
        try {
            let order = _findOrderById(orderId);
            order.status = ORDER_STATUS.NEED_RETURN;
            order.returnReason = ORDER_RETURN_REASON.BROKEN_ITEMS;
            dispatch(editOrder(order));

            let updatedCard = await moveOrderToTrelloList(orderId, trello.TRELLO_LIST_IDS.NOT_DELIVERED_LIST);
            return updatedCard === null ? "Lỗi khi chuyển đơn Trello" : null;
        } catch (e) {
            return e;
        }
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

    const markOrderAsShipped = async (orderId: string): Promise<string> => {
        try {
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

            let updatedCard = await moveOrderToTrelloList(orderId, trello.TRELLO_LIST_IDS.DONE_LIST);
            return updatedCard === null ? "Lỗi khi chuyển đơn Trello" : null;
        } catch (e) {
            return e;
        }
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
            let isAlreadyHasShippingCode = Boolean(order.shippingCode);
            order.shippingCode = code;
            dispatch(editOrder(order));

            // comment on trello
            let action = await trello.createComment({ text: code }, order.trelloCardId);
            if (action === null) return "Lỗi bình luận Trello";

            if (!isAlreadyHasShippingCode) {
                let updatedCard = await moveOrderToTrelloList(orderId, trello.TRELLO_LIST_IDS.DELIVERY_CREATED_LIST);
                if (updatedCard === null) return "Lỗi khi chuyển đơn Trello";
            }

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
        return order.status === ORDER_STATUS.PLACED && !Boolean(order.trelloCardId);
    }

    const pushToTrelloToDoList = async (order: Order): Promise<TrelloCard> => {
        let customer = _findCustomerById(order.customerId);
        try {
            //temp
            let newCard = await trello.createCard({
                name: order.name,
                desc: `${customer.name}  
                ${customer.mobile}  
                ${customer.address}  
                ${order.placedItems.map(item => `${item.count} băng ${item.type}. Thu ${order.codAmount.toLocaleString()}đ`)}  
                ${order.note}`,
                start: new Date(),
                pos: order.position,
                idLabels: [],
                idList: trello.TRELLO_LIST_IDS.TODO_LIST
            });
            return newCard;
        } catch (e) {
            return null;
        }
    }

    const calculateOrderPaymentAmount = (placedItems: OrderItem[], customerId: string): number => {
        let customer = _findCustomerById(customerId);
        return OrderHelper.calculateTotalOrderItemsAmount(placedItems) + OrderHelper.getShippingAmountByArea(customer.area);
    }

    const getAutoCODAmount = (paymentMethod: string, paymentAmount: number): number => {
        return paymentMethod === ORDER_PAYMENT_METHOD.BANK_TRANSFER_IN_ADVANCE ? 0 : paymentAmount;
    }

    const assignTrelloId = (orderId: string, trelloCard: TrelloCard): void => {
        let order = _findOrderById(orderId);
        order.trelloCardId = trelloCard.id;
        dispatch(editOrder(order));
    }

    const moveOrderToTrelloList = async (orderId: string, listId: string): Promise<TrelloCard> => {
        try {
            let order = _findOrderById(orderId);
            let updatedCard = await trello.updateCard({
                id: order.trelloCardId,
                idList: listId
            });
            return updatedCard;
        } catch (e) {
            return null;
        }
    }

    const createOrder = async (order: Order, customer: Customer, fileAttachments: RcFile[]): Promise<TrelloCard> => {
        dispatch(addOrder({ order: order, customer })); // add first to get position
        let createdOrder = store.getState().order.orders.find(e => e.id === order.id);
        let trelloCard = await pushToTrelloToDoList(createdOrder);

        //save trello card id
        createdOrder = cloneDeep(createdOrder);
        createdOrder.trelloCardId = trelloCard.id;
        dispatch(editOrder(createdOrder));

        // upload images
        await attachImagesToOrderOnTrello(createdOrder, fileAttachments);
        return trelloCard;
    }

    const attachImagesToOrderOnTrello = async (order: Order, files: RcFile[]): Promise<TrelloAttachment[]> => {
        let promises: Promise<TrelloAttachment>[] = [];
        promises = files.map(file => trello.createAttachment({
            name: order.name.concat("attachment").concat(nanoid(2)),
            mimeType: file.type,
            file: file
        }, order.trelloCardId));
        return Promise.all(promises);
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
        pushToTrelloToDoList,
        calculateOrderPaymentAmount,
        getAutoCODAmount,
        assignTrelloId,
        moveOrderToTrelloList,
        createOrder,
        attachImagesToOrderOnTrello
    }
}
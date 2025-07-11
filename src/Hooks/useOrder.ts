import {
    ORDER_PAYMENT_METHOD,
    ORDER_PRIORITY_STATUS,
    ORDER_RETURN_REASON,
    ORDER_STATUS
} from "@common/Constants/AppConstants";
import {Order} from "@store/Models/Order";
import {editCustomer} from "@store/Reducers/CustomerReducer";
import {
    addCodPayment,
    addDoneOrder,
    addOrder,
    editOrder,
    removeAllDoneOrder,
    removeDoneOrder
} from "@store/Reducers/OrderReducer";
import {RootState, store} from "@store/Store";
import {cloneDeep, uniq} from "lodash";
import {useDispatch, useSelector} from "react-redux";
import {useTrello} from "./Trello/useTrello";
import {Customer} from "@store/Models/Customer";
import {TrelloCard} from "./Trello/Models/TrelloCard";
import {TrelloCreateCardParam} from "./Trello/Models/ApiParam";
import {OrderHelper} from "@common/Helpers/OrderHelper";
import {OrderItem} from "@store/Models/OrderItem";
import {RcFile} from "antd/es/upload";
import {TrelloAttachment} from "./Trello/Models/TrelloAttachment";
import {nanoid} from "nanoid";
import moment from "moment";
import {CodPaymentCycle} from "@store/Models/CodPaymentCycle";

type UseOrder = {
    isShipped: (orderId: string) => boolean;
    isRefuseToReceive: (orderId: string) => boolean;
    isBrokenItems: (orderId: string) => boolean;
    canMarkAsWaitingForReturn: (orderId: string) => boolean;
    canMarkAsReturned: (orderId: string) => boolean;
    canMarkAsShipped: (orderId: string) => boolean;
    canMarkAsPayCOD: (orderId: string) => boolean;
    markOrderAsRefuseToReceive: (orderId: string) => Promise<string>;
    markOrderAsBrokenItems: (orderId: string) => Promise<string>;
    markOrderAsWaitingForReturn: (orderId: string) => string;
    markOrderAsReturned: (orderId: string) => string;
    markOrderAsShipped: (orderId: string) => Promise<string>;
    markOrderAsPayCOD: (orderId: string) => void;
    changeShippingCode: (orderId: string, code: string) => Promise<string>;
    isPushedTrello: (orderId: string) => boolean;
    canPushToTrello: (orderId: string) => boolean;
    pushToTrelloToDoList: (order: Order) => Promise<TrelloCard>;
    calculateOrderPaymentAmount: (placedItems: OrderItem[], customerId: string, isFreeShip?: boolean) => number;
    getAutoCODAmount: (paymentMethod: string, paymentAmount: number) => number;
    assignTrelloId: (orderId: string, trelloCard: TrelloCard) => void;
    moveOrderToTrelloList: (orderId: string, listId: string) => Promise<TrelloCard>;
    createOrder: (order: Order, customer: Customer, fileAttachments: RcFile[]) => Promise<TrelloCard>;
    updateOrder: (order: Order) => Promise<TrelloCard>;
    attachImagesToOrderOnTrello: (order: Order, files: RcFile[]) => Promise<TrelloAttachment[]>;
    isVipOrder: (order: Order) => boolean;
    isPriority: (order: Order) => boolean;
    isCustomerReturnLessThan4: (order: Order) => boolean;
    isBankTransferInAdvance: (order: Order) => boolean;
    isUrgent: (order: Order) => boolean;
    refund: (orderId: string, amount: number) => void;

    //statistic
    getTotalOrderPending: (fromDate: Date, toDate: Date) => number;
    getTotalCassettePending: (fromDate: Date, toDate: Date) => number;
    getTotalCassetteSold: (fromDate: Date, toDate: Date) => number;
    getTotalOrderSold: (fromDate: Date, toDate: Date) => number;
    getTotalCustomerSold: (fromDate: Date, toDate: Date) => number;
    getTotalAmountSold: (fromDate: Date, toDate: Date) => number;
    getTotalOrderBom: (fromDate: Date, toDate: Date) => number;
    getTotalAmountBom: (fromDate: Date, toDate: Date) => number;
    getTotalAmountSoldAll: () => number;
    getTotalOrderSoldAll: () => number;
    getTotalAmountBomAll: () => number;
    getTotalOrderBomAll: () => number;

    refreshDoneOrders: () => Promise<number>;
    addPaymentOrderCycle: (paymentCycle: CodPaymentCycle) => void;
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

    const _getLabelIds = (order: Order): string[] => {
        let labelIds = [];
        if (isVipOrder(order)) labelIds.push(trello.TRELLO_LIST_LABEL_IDS.VIP);
        if (isUrgent(order)) labelIds.push(trello.TRELLO_LIST_LABEL_IDS.URGENT);
        else if (isPriority(order)) labelIds.push(trello.TRELLO_LIST_LABEL_IDS.PRIORITY);
        if (isBankTransferInAdvance(order)) labelIds.push(trello.TRELLO_LIST_LABEL_IDS.BANK_TRANSFER_IN_ADVANCE);
        if (isCustomerReturnLessThan4(order)) labelIds.push(trello.TRELLO_LIST_LABEL_IDS.CUSTOMER_RETURN_LESS_THAN_4);
        return labelIds;
    }

    const _buildDesc = (order: Order, customer: Customer): string => {
        return `${customer.name}\n${customer.mobile}\n${customer.address}\n${order.placedItems.map(item => `${item.count} băng ${item.type}\n`)}\nThu ${order.codAmount.toLocaleString()}đ\n${order.note}`
    }

    const markOrderAsRefuseToReceive = async (orderId: string): Promise<string> => {
        try {
            let order = _findOrderById(orderId);
            order.status = ORDER_STATUS.WAITING_FOR_RETURNED;
            order.returnReason = ORDER_RETURN_REASON.REFUSE_TO_RECEIVE;

            let customer = _findCustomerById(order.customerId);
            customer.isInBlacklist = true;
            customer.isVIP = false;

            dispatch(editOrder({order, customer}));
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
            let customer = _findCustomerById(order.customerId);
            order.status = ORDER_STATUS.WAITING_FOR_RETURNED;
            order.returnReason = ORDER_RETURN_REASON.BROKEN_ITEMS;
            dispatch(editOrder({order, customer}));

            let updatedCard = await moveOrderToTrelloList(orderId, trello.TRELLO_LIST_IDS.NOT_DELIVERED_LIST);
            return updatedCard === null ? "Lỗi khi chuyển đơn Trello" : null;
        } catch (e) {
            return e;
        }
    }

    const markOrderAsWaitingForReturn = (orderId: string): string => {
        let order = _findOrderById(orderId);
        let customer = _findCustomerById(order.customerId);
        order.status = ORDER_STATUS.WAITING_FOR_RETURNED;
        dispatch(editOrder({order, customer}));
        return null;
    }

    const markOrderAsReturned = (orderId: string): string => {
        let order = _findOrderById(orderId);
        let customer = _findCustomerById(order.customerId);
        order.status = ORDER_STATUS.RETURNED;
        dispatch(editOrder({order, customer}));
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
            if (customer.buyCount > 4) customer.isVIP = true;

            dispatch(editOrder({order, customer}));
            dispatch(editCustomer(customer));

            let updatedCard = await moveOrderToTrelloList(orderId, trello.TRELLO_LIST_IDS.DONE_LIST);
            return updatedCard === null ? "Lỗi khi chuyển đơn Trello" : null;
        } catch (e) {
            return e;
        }
    }

    const markOrderAsPayCOD = (orderId: string): void => {
        let order = _findOrderById(orderId);
        let customer = _findCustomerById(order.customerId);
        order.isPayCOD = true;
        dispatch(editOrder({order, customer}));
    }

    const isRefuseToReceive = (orderId: string): boolean => {
        let order = _findOrderById(orderId);
        if (order === null) return false;
        return [ORDER_STATUS.WAITING_FOR_RETURNED, ORDER_STATUS.RETURNED].includes(order.status)
            && order.returnReason == ORDER_RETURN_REASON.REFUSE_TO_RECEIVE;
    }

    const isBrokenItems = (orderId: string): boolean => {
        let order = _findOrderById(orderId);
        if (order === null) return false;
        return [ORDER_STATUS.WAITING_FOR_RETURNED, ORDER_STATUS.RETURNED].includes(order.status)
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

    const canMarkAsPayCOD = (orderId: string): boolean => {
        let order = _findOrderById(orderId);
        if (order === null) return false;
        return order.isPayCOD === false;
    }

    const changeShippingCode = async (orderId: string, code: string): Promise<string> => {
        try {
            let order = _findOrderById(orderId);
            let customer = _findCustomerById(order.customerId);
            let isAlreadyHasShippingCode = Boolean(order.shippingCode);
            if (order.status !== ORDER_STATUS.CREATE_DELIVERY) order.status = ORDER_STATUS.CREATE_DELIVERY;
            order.shippingCode = code;
            dispatch(editOrder({order, customer}));

            // comment on trello
            let action = await trello.createComment({text: code}, order.trelloCardId);
            if (action === null) return "Lỗi bình luận Trello";

            if (!isAlreadyHasShippingCode) {
                let updatedCard = await moveOrderToTrelloList(orderId, trello.TRELLO_LIST_IDS.DELIVERY_CREATED_LIST);
                if (updatedCard === null) return "Lỗi khi chuyển đơn Trello";
            }

            dispatch(removeDoneOrder(order.trelloCardId));
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
            let newCard = await trello.createCard({
                name: order.name,
                desc: _buildDesc(order, customer),
                start: new Date(),
                pos: order.position,
                idLabels: _getLabelIds(order),
                idList: trello.TRELLO_LIST_IDS.TODO_LIST
            });
            return newCard;
        } catch (e) {
            return null;
        }
    }

    const calculateOrderPaymentAmount = (placedItems: OrderItem[], customerId: string, isFreeShip?: boolean): number => {
        let customer = _findCustomerById(customerId);
        return OrderHelper.calculateTotalOrderItemsAmount(placedItems) + (Boolean(isFreeShip) ? 0 : OrderHelper.getShippingAmountByArea(customer.area));
    }

    const getAutoCODAmount = (paymentMethod: string, paymentAmount: number): number => {
        return paymentMethod === ORDER_PAYMENT_METHOD.BANK_TRANSFER_IN_ADVANCE ? 0 : paymentAmount;
    }

    const assignTrelloId = (orderId: string, trelloCard: TrelloCard): void => {
        let order = _findOrderById(orderId);
        let customer = _findCustomerById(order.customerId);
        order.trelloCardId = trelloCard.id;
        dispatch(editOrder({order, customer}));
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
        let previousPendingOrders = orders.filter(o => o.status === ORDER_STATUS.PLACED);
        dispatch(addOrder({order: order, customer})); // add first to get position
        let createdOrder = store.getState().order.orders.find(e => e.id === order.id);
        let trelloCard = await pushToTrelloToDoList(createdOrder);

        //update all other pending orders's position
        let currentPendingOrders = store.getState().order.orders.filter(o => o.status === ORDER_STATUS.PLACED);
        const oldPosMap = new Map(previousPendingOrders.map(order => [order.id, order.position]));
        let changedPositionOrders = currentPendingOrders.filter(order => {
            const oldPos = oldPosMap.get(order.id);
            return oldPos !== undefined && oldPos !== order.position;
        });
        let promises = changedPositionOrders.map(o => trello.updateCard({
            id: o.trelloCardId,
            pos: o.position
        }));
        await Promise.all(promises);

        //save trello card id
        createdOrder = cloneDeep(createdOrder);
        createdOrder.trelloCardId = trelloCard.id;
        dispatch(editOrder({order: createdOrder, customer}));

        // upload images
        await attachImagesToOrderOnTrello(createdOrder, fileAttachments);
        return trelloCard;
    }

    const updateOrder = async (order: Order): Promise<TrelloCard> => {
        let previousPendingOrders = orders.filter(o => o.status === ORDER_STATUS.PLACED && o.id !== order.id);
        let customer = _findCustomerById(order.customerId);
        dispatch(editOrder({order, customer}));
        let updatedOrder = store.getState().order.orders.find(e => e.id === order.id);

        let updatedCard = await trello.updateCard({
            id: updatedOrder.trelloCardId,
            desc: _buildDesc(updatedOrder, customer),
            pos: updatedOrder.position,
            idLabels: _getLabelIds(updatedOrder)
        });

        //update all other pending orders's position
        let currentPendingOrders = store.getState().order.orders.filter(o => o.status === ORDER_STATUS.PLACED);
        const oldPosMap = new Map(previousPendingOrders.map(order => [order.id, order.position]));
        let changedPositionOrders = currentPendingOrders.filter(order => {
            const oldPos = oldPosMap.get(order.id);
            return oldPos !== undefined && oldPos !== order.position;
        });
        let promises = changedPositionOrders.map(o => trello.updateCard({
            id: o.trelloCardId,
            pos: o.position
        }));
        await Promise.all(promises);
        return updatedCard;
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

    const isVipOrder = (order: Order): boolean => {
        let customer = _findCustomerById(order.customerId);
        return customer.isVIP;
    }

    const isPriority = (order: Order): boolean => {
        return order.priorityStatus === ORDER_PRIORITY_STATUS.PRIORITY;
    }

    const isUrgent = (order: Order): boolean => {
        return order.priorityStatus === ORDER_PRIORITY_STATUS.URGENT;
    }

    const isCustomerReturnLessThan4 = (order: Order): boolean => {
        let customer = _findCustomerById(order.customerId);
        return customer.buyCount > 1 && customer.buyCount <= 4;
    }

    const isBankTransferInAdvance = (order: Order): boolean => {
        return order.paymentMethod === ORDER_PAYMENT_METHOD.BANK_TRANSFER_IN_ADVANCE;
    }

    const refund = (orderId: string, amount: number): void => {
        let order = _findOrderById(orderId);
        let customer = _findCustomerById(order.customerId);
        order.isRefund = amount > 0;
        order.refundAmount = amount;
        dispatch(editOrder({order, customer}));
    }

    const getTotalOrderPending = (fromDate: Date, toDate: Date): number => {
        return orders.filter(o => o.status === ORDER_STATUS.PLACED && moment(o.createdDate).isBetween(moment(fromDate), moment(toDate))).length;
    }

    const getTotalCassettePending = (fromDate: Date, toDate: Date): number => {
        return orders.filter(o => o.status === ORDER_STATUS.PLACED && moment(o.createdDate).isBetween(moment(fromDate), moment(toDate))).reduce((prev, cur) => {
            return prev + cur.placedItems.reduce((prev1, cur1) => prev1 + cur1.count, 0);
        }, 0)
    }
    const getTotalCassetteSold = (fromDate: Date, toDate: Date): number => {
        return orders.filter(o => o.status === ORDER_STATUS.SHIPPED && moment(o.createdDate).isBetween(moment(fromDate), moment(toDate))).reduce((prev, cur) => {
            return prev + cur.placedItems.reduce((prev1, cur1) => prev1 + cur1.count, 0);
        }, 0)
    }
    const getTotalOrderSold = (fromDate: Date, toDate: Date): number => {
        return orders.filter(o => o.status === ORDER_STATUS.SHIPPED && moment(o.createdDate).isBetween(moment(fromDate), moment(toDate))).length;
    }
    const getTotalCustomerSold = (fromDate: Date, toDate: Date): number => {
        return uniq(orders.filter(o => o.status === ORDER_STATUS.SHIPPED && moment(o.createdDate).isBetween(moment(fromDate), moment(toDate)))
            .map(e => e.customerId)).length;
    }
    const getTotalAmountSold = (fromDate: Date, toDate: Date): number => {
        return orders.filter(o => o.status === ORDER_STATUS.SHIPPED && moment(o.createdDate).isBetween(moment(fromDate), moment(toDate))).reduce((prev, cur) => {
            return prev + cur.placedItems.reduce((prev1, cur1) => prev1 + (cur1.count * cur1.unitPrice), 0);
        }, 0)
    }
    const getTotalOrderBom = (fromDate: Date, toDate: Date): number => {
        return orders.filter(o => o.status === ORDER_STATUS.RETURNED && o.returnReason === ORDER_RETURN_REASON.REFUSE_TO_RECEIVE
            && moment(o.createdDate).isBetween(moment(fromDate), moment(toDate))).length;
    }
    const getTotalAmountBom = (fromDate: Date, toDate: Date): number => {
        return orders.filter(o => o.status === ORDER_STATUS.RETURNED && o.returnReason === ORDER_RETURN_REASON.REFUSE_TO_RECEIVE && moment(o.createdDate).isBetween(moment(fromDate), moment(toDate))).reduce((prev, cur) => {
            return prev + cur.placedItems.reduce((prev1, cur1) => prev1 + (cur1.count * cur1.unitPrice), 0);
        }, 0)
    }

    const getTotalAmountSoldAll = (): number => {
        return orders.filter(o => o.status === ORDER_STATUS.SHIPPED).reduce((prev, cur) => {
            return prev + cur.placedItems.reduce((prev1, cur1) => prev1 + (cur1.count * cur1.unitPrice), 0);
        }, 0)
    }

    const getTotalOrderSoldAll = (): number => {
        return orders.filter(o => o.status === ORDER_STATUS.SHIPPED).length;
    }

    const getTotalAmountBomAll = (): number => {
        return orders.filter(o => o.status === ORDER_STATUS.RETURNED && o.returnReason === ORDER_RETURN_REASON.REFUSE_TO_RECEIVE).reduce((prev, cur) => {
            return prev + cur.placedItems.reduce((prev1, cur1) => prev1 + (cur1.count * cur1.unitPrice), 0);
        }, 0)
    }

    const getTotalOrderBomAll = (): number => {
        return orders.filter(o => o.status === ORDER_STATUS.RETURNED && o.returnReason === ORDER_RETURN_REASON.REFUSE_TO_RECEIVE).length;
    }

    const refreshDoneOrders = async (): Promise<number> => {
        dispatch(removeAllDoneOrder());
        let cards = await trello.getCardsByList(trello.TRELLO_LIST_IDS.TODO_LIST);
        let doneOrders = cards.filter(e => e.dueComplete == true).map(e => e.id);
        doneOrders.forEach(e => {
            dispatch(addDoneOrder(e));
        })
        return doneOrders.length || 0;
    }

    const addPaymentOrderCycle = (paymentCycle: CodPaymentCycle): void => {
        dispatch(addCodPayment(paymentCycle));
        paymentCycle.paymentOrders.forEach(orderId => {
            let order = _findOrderById(orderId);
            let customer = _findCustomerById(order.customerId);
            order.isPayCOD = true;
            dispatch(editOrder({order, customer}));
        });
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
        attachImagesToOrderOnTrello,
        isVipOrder,
        isBankTransferInAdvance,
        isUrgent,
        isCustomerReturnLessThan4,
        isPriority,
        refund,
        updateOrder,
        getTotalAmountSold,
        getTotalCassetteSold,
        getTotalCustomerSold,
        getTotalAmountBom,
        getTotalOrderSold,
        getTotalCassettePending,
        getTotalOrderBom,
        getTotalOrderPending,
        getTotalAmountSoldAll,
        getTotalOrderSoldAll,
        getTotalAmountBomAll,
        getTotalOrderBomAll,
        canMarkAsPayCOD,
        markOrderAsPayCOD,
        refreshDoneOrders,
        addPaymentOrderCycle
    }
}
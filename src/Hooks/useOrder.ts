import {ORDER_RETURN_REASON, ORDER_STATUS} from "@common/Constants/AppConstants";
import {Order} from "@store/Models/Order";
import {editCustomer} from "@store/Reducers/CustomerReducer";
import {
    addCodPayment,
    addOrder,
    clearSyncFailure,
    editOrder,
    markSyncFailureRetrying,
    removeDoneOrder,
    setDoneOrders,
    upsertSyncFailure
} from "@store/Reducers/OrderReducer";
import {RootState, store} from "@store/Store";
import {cloneDeep, uniq} from "lodash";
import {useDispatch, useSelector} from "react-redux";
import {useTrello} from "./Trello/useTrello";
import {Customer} from "@store/Models/Customer";
import {TrelloCard} from "./Trello/Models/TrelloCard";
import {TrelloAction} from "./Trello/Models/TrelloAction";
import {OrderItem} from "@store/Models/OrderItem";
import {RcFile} from "antd/es/upload";
import {TrelloAttachment} from "./Trello/Models/TrelloAttachment";
import {nanoid} from "nanoid";
import moment from "moment";
import {CodPaymentCycle} from "@store/Models/CodPaymentCycle";
import {OrderDomainHelper} from "@common/Helpers/OrderDomainHelper";
import {createOrderTrelloAdapter} from "./Trello/OrderTrelloAdapter";
import {isTrelloOperationFailure, TrelloOperationResult} from "./Trello/TrelloOperationResult";
import {OrderSyncFailure} from "@store/Models/OrderSyncFailure";
import {
    createOrderWorkflowFailure,
    createOrderWorkflowSuccess,
    OrderWorkflowResult
} from "./OrderWorkflowResult";

type UseOrder = {
    isShipped: (orderId: string) => boolean;
    isRefuseToReceive: (orderId: string) => boolean;
    isBrokenItems: (orderId: string) => boolean;
    canMarkAsWaitingForReturn: (orderId: string) => boolean;
    canMarkAsReturned: (orderId: string) => boolean;
    canMarkAsShipped: (orderId: string) => boolean;
    canMarkAsPayCOD: (orderId: string) => boolean;
    markOrderAsRefuseToReceive: (orderId: string) => Promise<OrderWorkflowResult<TrelloCard>>;
    markOrderAsBrokenItems: (orderId: string) => Promise<OrderWorkflowResult<TrelloCard>>;
    markOrderAsWaitingForReturn: (orderId: string) => string;
    markOrderAsReturned: (orderId: string) => string;
    markOrderAsShipped: (orderId: string) => Promise<OrderWorkflowResult<TrelloCard>>;
    markOrderAsPayCOD: (orderId: string) => void;
    changeShippingCode: (orderId: string, code: string) => Promise<OrderWorkflowResult<TrelloCard>>;
    isPushedTrello: (orderId: string) => boolean;
    canPushToTrello: (orderId: string) => boolean;
    pushToTrelloToDoList: (order: Order) => Promise<TrelloOperationResult<TrelloCard>>;
    calculateOrderPaymentAmount: (placedItems: OrderItem[], customerId: string, isFreeShip?: boolean) => number;
    getAutoCODAmount: (paymentMethod: string, paymentAmount: number) => number;
    assignTrelloId: (orderId: string, trelloCard: TrelloCard) => void;
    moveOrderToTrelloList: (orderId: string, listId: string) => Promise<TrelloOperationResult<TrelloCard>>;
    createOrder: (order: Order, customer: Customer, fileAttachments: RcFile[]) => Promise<OrderWorkflowResult<TrelloCard>>;
    updateOrder: (order: Order) => Promise<OrderWorkflowResult<TrelloCard>>;
    attachImagesToOrderOnTrello: (order: Order, files: RcFile[]) => Promise<OrderWorkflowResult<TrelloAttachment[]>>;
    retryOrderSyncFailure: (failureId: string) => Promise<OrderWorkflowResult<TrelloCard | TrelloAttachment | TrelloAction | void>>;
    clearOrderSyncFailure: (failureId: string) => void;
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
    const syncFailures = useSelector((state: RootState) => state.order.syncFailures);
    const trello = useTrello();
    const orderTrelloAdapter = createOrderTrelloAdapter(trello);

    const _findOrderById = (orderId: string): Order => {
        let order = orders.find(e => e.id == orderId);
        return cloneDeep(order);
    }

    const _findCustomerById = (customerId: string): Customer => {
        let customer = customers.find(e => e.id == customerId);
        return cloneDeep(customer);
    }

    const _buildSyncFailureId = (orderId: string, operation: string, retryPayload: unknown, trelloCardId?: string): string => {
        const payload = retryPayload as any;
        const contextKey = payload?.attachment?.retryKey || payload?.attachment?.name || payload?.shippingCode || payload?.idList || trelloCardId || "local";
        return `${orderId}:${operation}:${contextKey}`;
    }

    const _recordTrelloResult = <T>(orderId: string, result: TrelloOperationResult<T>, trelloCardId?: string): OrderSyncFailure | null => {
        if (!isTrelloOperationFailure(result)) {
            dispatch(clearSyncFailure(_buildSyncFailureId(orderId, result.operation, result.retryPayload, trelloCardId)));
            return null;
        }

        const now = new Date().toISOString();
        const syncFailure: OrderSyncFailure = {
            id: _buildSyncFailureId(orderId, result.operation, result.retryPayload, trelloCardId),
            orderId,
            operation: result.operation,
            status: "failed",
            message: result.message,
            retryable: result.retryable,
            createdAt: now,
            updatedAt: now,
            trelloCardId,
            retryPayload: result.retryPayload
        };
        dispatch(upsertSyncFailure(syncFailure));
        return syncFailure;
    }

    const _moveOrderToTrelloList = async (orderId: string, listId: string): Promise<{ result: TrelloOperationResult<TrelloCard>, syncFailure: OrderSyncFailure | null }> => {
        let order = _findOrderById(orderId);
        const result = await orderTrelloAdapter.moveOrderCard(order?.trelloCardId, listId, orderId);
        const syncFailure = _recordTrelloResult(orderId, result, order?.trelloCardId);
        return {result, syncFailure};
    }

    const _restoreSyncFailureAfterRetry = <T>(failure: OrderSyncFailure, result: TrelloOperationResult<T>): OrderSyncFailure => {
        const now = new Date().toISOString();
        const restoredFailure: OrderSyncFailure = {
            ...failure,
            status: "failed",
            message: isTrelloOperationFailure(result) ? result.message : failure.message,
            retryable: isTrelloOperationFailure(result) ? result.retryable : failure.retryable,
            updatedAt: now,
            retryPayload: isTrelloOperationFailure(result) && result.retryPayload ? result.retryPayload : failure.retryPayload
        };
        dispatch(upsertSyncFailure(restoredFailure));
        return restoredFailure;
    }

    const _manualAttachmentReselectResult = (failure: OrderSyncFailure): OrderWorkflowResult<void> => {
        const message = "Cần chọn lại ảnh để đồng bộ Trello";
        const now = new Date().toISOString();
        dispatch(upsertSyncFailure({
            ...failure,
            status: "failed",
            message,
            updatedAt: now
        }));
        return createOrderWorkflowFailure({operation: "retry-sync", message});
    }

    const markOrderAsRefuseToReceive = async (orderId: string): Promise<OrderWorkflowResult<TrelloCard>> => {
        try {
            let order = _findOrderById(orderId);
            let customer = _findCustomerById(order.customerId);
            let transition = OrderDomainHelper.markOrderAsRefuseToReceiveTransition(order, customer);
            order = transition.order;
            customer = transition.customer;

            dispatch(editOrder({order, customer}));
            dispatch(editCustomer(customer));

            let {result, syncFailure} = await _moveOrderToTrelloList(orderId, trello.TRELLO_LIST_IDS.NOT_DELIVERED_LIST);
            return createOrderWorkflowSuccess({
                operation: "mark-refuse-to-receive",
                data: isTrelloOperationFailure(result) ? undefined : result.data,
                syncFailures: syncFailure ? [syncFailure] : [],
                message: "Đã đánh dấu đơn bom"
            });
        } catch (e) {
            return createOrderWorkflowFailure({operation: "mark-refuse-to-receive", message: "Không thể đánh dấu đơn bom", error: e});
        }
    }

    const markOrderAsBrokenItems = async (orderId: string): Promise<OrderWorkflowResult<TrelloCard>> => {
        try {
            let order = _findOrderById(orderId);
            let customer = _findCustomerById(order.customerId);
            let transition = OrderDomainHelper.markOrderAsBrokenItemsTransition(order, customer);
            order = transition.order;
            customer = transition.customer;
            dispatch(editOrder({order, customer}));

            let {result, syncFailure} = await _moveOrderToTrelloList(orderId, trello.TRELLO_LIST_IDS.NOT_DELIVERED_LIST);
            return createOrderWorkflowSuccess({
                operation: "mark-broken-items",
                data: isTrelloOperationFailure(result) ? undefined : result.data,
                syncFailures: syncFailure ? [syncFailure] : [],
                message: "Đã đánh dấu đơn hàng lỗi"
            });
        } catch (e) {
            return createOrderWorkflowFailure({operation: "mark-broken-items", message: "Không thể đánh dấu đơn hàng lỗi", error: e});
        }
    }

    const markOrderAsWaitingForReturn = (orderId: string): string => {
        let order = _findOrderById(orderId);
        let customer = _findCustomerById(order.customerId);
        let transition = OrderDomainHelper.markOrderAsWaitingForReturnTransition(order, customer);
        order = transition.order;
        customer = transition.customer;
        dispatch(editOrder({order, customer}));
        return null;
    }

    const markOrderAsReturned = (orderId: string): string => {
        let order = _findOrderById(orderId);
        let customer = _findCustomerById(order.customerId);
        let transition = OrderDomainHelper.markOrderAsReturnedTransition(order, customer);
        order = transition.order;
        customer = transition.customer;
        dispatch(editOrder({order, customer}));
        return null;
    }

    const markOrderAsShipped = async (orderId: string): Promise<OrderWorkflowResult<TrelloCard>> => {
        try {
            let order = _findOrderById(orderId);
            let customer = _findCustomerById(order.customerId);
            let transition = OrderDomainHelper.markOrderAsShippedTransition(order, customer);
            order = transition.order;
            customer = transition.customer;

            dispatch(editOrder({order, customer}));
            dispatch(editCustomer(customer));

            let {result, syncFailure} = await _moveOrderToTrelloList(orderId, trello.TRELLO_LIST_IDS.DONE_LIST);
            return createOrderWorkflowSuccess({
                operation: "mark-shipped",
                data: isTrelloOperationFailure(result) ? undefined : result.data,
                syncFailures: syncFailure ? [syncFailure] : [],
                message: "Đã đánh dấu đơn hoàn thành"
            });
        } catch (e) {
            return createOrderWorkflowFailure({operation: "mark-shipped", message: "Không thể đánh dấu đơn hoàn thành", error: e});
        }
    }

    const markOrderAsPayCOD = (orderId: string): void => {
        let order = _findOrderById(orderId);
        let customer = _findCustomerById(order.customerId);
        let transition = OrderDomainHelper.markOrderAsPayCODTransition(order, customer);
        order = transition.order;
        customer = transition.customer;
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
        return OrderDomainHelper.canMarkAsWaitingForReturn(order);
    }

    const canMarkAsReturned = (orderId: string): boolean => {
        let order = _findOrderById(orderId);
        if (order === null) return false;
        return OrderDomainHelper.canMarkAsReturned(order);
    }

    const canMarkAsShipped = (orderId: string): boolean => {
        let order = _findOrderById(orderId);
        if (order === null) return false;
        return OrderDomainHelper.canMarkAsShipped(order);
    }

    const canMarkAsPayCOD = (orderId: string): boolean => {
        let order = _findOrderById(orderId);
        if (order === null) return false;
        return OrderDomainHelper.canMarkAsPayCOD(order);
    }

    const changeShippingCode = async (orderId: string, code: string): Promise<OrderWorkflowResult<TrelloCard>> => {
        try {
            let order = _findOrderById(orderId);
            let customer = _findCustomerById(order.customerId);
            let transition = OrderDomainHelper.changeShippingCodeTransition(order, customer, code);
            order = transition.order;
            customer = transition.customer;
            dispatch(editOrder({order, customer}));

            // comment on trello
            const syncFailures: OrderSyncFailure[] = [];
            let action = await orderTrelloAdapter.createShippingCodeComment(order.trelloCardId, code, order.id);
            let commentFailure = _recordTrelloResult(order.id, action, order.trelloCardId);
            if (commentFailure) syncFailures.push(commentFailure);

            let updatedCard: TrelloCard = undefined;
            if (transition.isFirstShippingCode && !commentFailure) {
                let move = await _moveOrderToTrelloList(orderId, trello.TRELLO_LIST_IDS.DELIVERY_CREATED_LIST);
                if (move.syncFailure) syncFailures.push(move.syncFailure);
                else updatedCard = isTrelloOperationFailure(move.result) ? undefined : move.result.data;
            }

            if (syncFailures.length === 0) dispatch(removeDoneOrder(order.trelloCardId));
            return createOrderWorkflowSuccess({
                operation: "change-shipping-code",
                data: updatedCard,
                syncFailures,
                message: "Lưu mã vận đơn thành công"
            });
        } catch (e) {
            return createOrderWorkflowFailure({operation: "change-shipping-code", message: "Không thể lưu mã vận đơn", error: e});
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

    const pushToTrelloToDoList = async (order: Order): Promise<TrelloOperationResult<TrelloCard>> => {
        let customer = _findCustomerById(order.customerId);
        const result = await orderTrelloAdapter.createOrderCard(order, customer);
        _recordTrelloResult(order.id, result, order.trelloCardId);
        return result;
    }

    const calculateOrderPaymentAmount = (placedItems: OrderItem[], customerId: string, isFreeShip?: boolean): number => {
        let customer = _findCustomerById(customerId);
        return OrderDomainHelper.calculateOrderPaymentAmountFromCustomer(placedItems, customer, isFreeShip);
    }

    const getAutoCODAmount = (paymentMethod: string, paymentAmount: number): number => {
        return OrderDomainHelper.getAutoCODAmount(paymentMethod, paymentAmount);
    }

    const assignTrelloId = (orderId: string, trelloCard: TrelloCard): void => {
        let order = _findOrderById(orderId);
        let customer = _findCustomerById(order.customerId);
        order.trelloCardId = trelloCard.id;
        dispatch(editOrder({order, customer}));
    }

    const moveOrderToTrelloList = async (orderId: string, listId: string): Promise<TrelloOperationResult<TrelloCard>> => {
        return (await _moveOrderToTrelloList(orderId, listId)).result;
    }

    const createOrder = async (order: Order, customer: Customer, fileAttachments: RcFile[]): Promise<OrderWorkflowResult<TrelloCard>> => {
        // let previousPendingOrders = orders.filter(o => o.status === ORDER_STATUS.PLACED);
        try {
            dispatch(addOrder({order: order, customer})); // add first to get position
            let createdOrder = store.getState().order.orders.find(e => e.id === order.id);
            let trelloCard = await orderTrelloAdapter.createOrderCard(createdOrder, customer);
            let cardFailure = _recordTrelloResult(createdOrder.id, trelloCard, createdOrder.trelloCardId);
            const syncFailures: OrderSyncFailure[] = cardFailure ? [cardFailure] : [];

            // //update all other pending orders's position
            // let currentPendingOrders = store.getState().order.orders.filter(o => o.status === ORDER_STATUS.PLACED);
            // const oldPosMap = new Map(previousPendingOrders.map(order => [order.id, order.position]));
            // let changedPositionOrders = currentPendingOrders.filter(order => {
            //     const oldPos = oldPosMap.get(order.id);
            //     return oldPos !== undefined && oldPos !== order.position;
            // });
            // let promises = changedPositionOrders.map(o => trello.updateCard({
            //     id: o.trelloCardId,
            //     pos: o.position
            // }));
            // await Promise.all(promises);

            if (!isTrelloOperationFailure(trelloCard)) {
                //save trello card id
                createdOrder = cloneDeep(createdOrder);
                createdOrder.trelloCardId = trelloCard.data.id;
                dispatch(editOrder({order: createdOrder, customer}));

                // upload images
                let attachmentResult = await attachImagesToOrderOnTrello(createdOrder, fileAttachments);
                syncFailures.push(...attachmentResult.syncFailures);
            }

            return createOrderWorkflowSuccess({
                operation: "create-order",
                data: isTrelloOperationFailure(trelloCard) ? undefined : trelloCard.data,
                syncFailures,
                message: "Tạo đơn hàng thành công"
            });
        } catch (e) {
            return createOrderWorkflowFailure({operation: "create-order", message: "Tạo đơn hàng lỗi", error: e});
        }
    }

    const updateOrder = async (order: Order): Promise<OrderWorkflowResult<TrelloCard>> => {
        try {
            let previousPendingOrders = orders.filter(o => o.status === ORDER_STATUS.PLACED && o.id !== order.id);
            let customer = _findCustomerById(order.customerId);
            dispatch(editOrder({order, customer}));
            let updatedOrder = store.getState().order.orders.find(e => e.id === order.id);
            const syncFailures: OrderSyncFailure[] = [];

            let updatedCard = await orderTrelloAdapter.updateOrderCard(updatedOrder, customer);
            let mainFailure = _recordTrelloResult(updatedOrder.id, updatedCard, updatedOrder.trelloCardId);
            if (mainFailure) syncFailures.push(mainFailure);

            //update all other pending orders's position
            let currentPendingOrders = store.getState().order.orders.filter(o => o.status === ORDER_STATUS.PLACED);
            const oldPosMap = new Map(previousPendingOrders.map(order => [order.id, order.position]));
            let changedPositionOrders = currentPendingOrders.filter(order => {
                const oldPos = oldPosMap.get(order.id);
                return oldPos !== undefined && oldPos !== order.position;
            });
            let relatedResults = await Promise.all(changedPositionOrders.map(o => {
                let relatedCustomer = _findCustomerById(o.customerId);
                return orderTrelloAdapter.updateOrderCard(o, relatedCustomer);
            }));
            relatedResults.forEach((result, index) => {
                const relatedOrder = changedPositionOrders[index];
                const failure = _recordTrelloResult(relatedOrder.id, result, relatedOrder.trelloCardId);
                if (failure) syncFailures.push(failure);
            });
            return createOrderWorkflowSuccess({
                operation: "update-order",
                data: isTrelloOperationFailure(updatedCard) ? undefined : updatedCard.data,
                syncFailures,
                message: "Đã lưu thay đổi"
            });
        } catch (e) {
            return createOrderWorkflowFailure({operation: "update-order", message: "Không thể lưu thay đổi", error: e});
        }
    }

    const attachImagesToOrderOnTrello = async (order: Order, files: RcFile[]): Promise<OrderWorkflowResult<TrelloAttachment[]>> => {
        try {
            const syncFailures: OrderSyncFailure[] = [];
            const attachments: TrelloAttachment[] = [];
            let results = await Promise.all(files.map(file => {
                const retryKey = `${file.name}:${nanoid(2)}`;
                return orderTrelloAdapter.createOrderAttachment(order, {
                    name: order.name.concat("attachment").concat(nanoid(2)),
                    mimeType: file.type,
                    file: file,
                    retryKey
                });
            }));
            results.forEach(result => {
                const failure = _recordTrelloResult(order.id, result, order.trelloCardId);
                if (failure) syncFailures.push(failure);
                else if (!isTrelloOperationFailure(result)) attachments.push(result.data);
            });
            return createOrderWorkflowSuccess({
                operation: "attach-images",
                data: attachments,
                syncFailures,
                message: "Lưu ảnh đính kèm thành công"
            });
        } catch (e) {
            return createOrderWorkflowFailure({operation: "attach-images", message: "Không thể lưu ảnh đính kèm", error: e});
        }
    }

    const retryOrderSyncFailure = async (failureId: string): Promise<OrderWorkflowResult<TrelloCard | TrelloAttachment | TrelloAction | void>> => {
        const failure = store.getState().order.syncFailures.find(item => item.id === failureId) || syncFailures.find(item => item.id === failureId);
        if (!failure) return createOrderWorkflowFailure({operation: "retry-sync", message: "Không tìm thấy lỗi đồng bộ"});

        const currentOrder = store.getState().order.orders.find(item => item.id === failure.orderId);
        if (!currentOrder) return createOrderWorkflowFailure({operation: "retry-sync", message: "Không tìm thấy đơn hàng"});

        const currentCustomer = store.getState().customer.customers.find(item => item.id === currentOrder.customerId);
        if (!currentCustomer) return createOrderWorkflowFailure({operation: "retry-sync", message: "Không tìm thấy khách hàng"});

        dispatch(markSyncFailureRetrying({id: failure.id, updatedAt: new Date().toISOString()}));
        const retryPayload = failure.retryPayload as any;
        let result: TrelloOperationResult<TrelloCard | TrelloAttachment | TrelloAction | void>;

        switch (failure.operation) {
            case "create-card":
                const createCardResult = await orderTrelloAdapter.createOrderCard(currentOrder, currentCustomer, retryPayload?.idList || trello.TRELLO_LIST_IDS.TODO_LIST);
                result = createCardResult;
                if (!isTrelloOperationFailure(createCardResult)) {
                    let updatedOrder = cloneDeep(currentOrder);
                    updatedOrder.trelloCardId = createCardResult.data.id;
                    dispatch(editOrder({order: updatedOrder, customer: currentCustomer}));
                }
                break;
            case "update-card":
                result = await orderTrelloAdapter.updateOrderCard(currentOrder, currentCustomer);
                break;
            case "move-card":
                result = await orderTrelloAdapter.moveOrderCard(currentOrder.trelloCardId || failure.trelloCardId, retryPayload?.idList, currentOrder.id);
                break;
            case "create-comment":
                result = await orderTrelloAdapter.createShippingCodeComment(
                    currentOrder.trelloCardId || failure.trelloCardId,
                    retryPayload?.shippingCode || currentOrder.shippingCode,
                    currentOrder.id
                );
                break;
            case "create-attachment":
                return _manualAttachmentReselectResult(failure);
            default:
                return createOrderWorkflowFailure({operation: "retry-sync", message: "Chưa hỗ trợ thử lại thao tác này"});
        }

        if (isTrelloOperationFailure(result)) {
            const restoredFailure = _restoreSyncFailureAfterRetry(failure, result);
            return createOrderWorkflowFailure({operation: "retry-sync", message: restoredFailure.message});
        }

        dispatch(clearSyncFailure(failure.id));
        return createOrderWorkflowSuccess({
            operation: "retry-sync",
            data: result.data,
            message: "Đồng bộ Trello thành công"
        });
    }

    const clearOrderSyncFailure = (failureId: string): void => {
        dispatch(clearSyncFailure(failureId));
    }

    const isVipOrder = (order: Order): boolean => {
        let customer = _findCustomerById(order.customerId);
        return OrderDomainHelper.isVipOrder(order, customer);
    }

    const isPriority = (order: Order): boolean => {
        return OrderDomainHelper.isPriority(order);
    }

    const isUrgent = (order: Order): boolean => {
        return OrderDomainHelper.isUrgent(order);
    }

    const isCustomerReturnLessThan4 = (order: Order): boolean => {
        let customer = _findCustomerById(order.customerId);
        return OrderDomainHelper.isCustomerReturnLessThan4(order, customer);
    }

    const isBankTransferInAdvance = (order: Order): boolean => {
        return OrderDomainHelper.isBankTransferInAdvance(order);
    }

    const refund = (orderId: string, amount: number): void => {
        let order = _findOrderById(orderId);
        let customer = _findCustomerById(order.customerId);
        let transition = OrderDomainHelper.refundTransition(order, customer, amount);
        order = transition.order;
        customer = transition.customer;
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
        let cards = await trello.getCardsByList(trello.TRELLO_LIST_IDS.TODO_LIST);
        let doneOrders = cards.filter(e => e.dueComplete == true).map(e => e.id);
        dispatch(setDoneOrders(doneOrders));
        return doneOrders.length || 0;
    }

    const addPaymentOrderCycle = (paymentCycle: CodPaymentCycle): void => {
        dispatch(addCodPayment(paymentCycle));
        paymentCycle.paymentOrders.forEach(orderId => {
            let order = _findOrderById(orderId);
            let customer = _findCustomerById(order.customerId);
            let transition = OrderDomainHelper.markOrderAsPayCODTransition(order, customer);
            order = transition.order;
            customer = transition.customer;
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
        retryOrderSyncFailure,
        clearOrderSyncFailure,
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

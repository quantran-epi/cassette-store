import { createSelector, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { Order } from '@store/Models/Order'
import { OrderHelper } from "@common/Helpers/OrderHelper";
import { ORDER_STATUS } from "@common/Constants/AppConstants";
import { Customer } from "@store/Models/Customer";
import { cloneDeep } from 'lodash';
import { RootState } from '@store/Store';

export interface OrderState {
    orders: Order[];
    lastSequence: number;
}

const initialState: OrderState = {
    orders: [],
    lastSequence: 0
}

export const orderSlice = createSlice({
    name: 'order',
    initialState,
    reducers: {
        add: (state, action: PayloadAction<{ order: Order, customer: Customer }>) => {
            let newOrder = cloneDeep(action.payload.order);
            newOrder.priorityMark = OrderHelper.calculatePendingOrderPrioritymark(newOrder,
                action.payload.customer);
            let pendingOrders = [...state.orders.filter(e => e.status === ORDER_STATUS.PLACED), newOrder];
            pendingOrders = pendingOrders.slice()
                .sort((a, b) => b.priorityMark - a.priorityMark)
                .map((order, index) => ({
                    ...order,
                    position: index,
                }));
            state.orders = [...state.orders.filter(e => !pendingOrders.map(i => i.id).includes(e.id)), ...pendingOrders];
            state.lastSequence = newOrder.sequence;
        },
        edit: (state, action: PayloadAction<Order>) => {
            state.orders = state.orders.map(e => {
                if (e.id === action.payload.id) return action.payload;
                return e;
            })
        },
        remove: (state, action: PayloadAction<string[]>) => {
            state.orders = state.orders.filter(o => !action.payload.includes(o.id));
        },
        reset: (state) => {
            state.orders = [];
        }
    },
})

const selectOrders = (state: RootState) => state.order.orders;

export const selectSortedPendingOrders = createSelector(
    [selectOrders],
    (orders) => {
        return orders
            .filter(order => order.status === ORDER_STATUS.PLACED)
            .sort((a, b) => a.position - b.position); // tăng dần theo position
    }
);

// Action creators are generated for each case reducer function
export const { add: addOrder, edit: editOrder, remove: removeOrder, reset: resetOrder } = orderSlice.actions

export default orderSlice.reducer
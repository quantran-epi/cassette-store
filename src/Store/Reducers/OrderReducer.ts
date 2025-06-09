import {createSlice} from '@reduxjs/toolkit'
import type {PayloadAction} from '@reduxjs/toolkit'
import {Order} from '@store/Models/Order'
import {OrderHelper} from "@common/Helpers/OrderHelper";
import {ORDER_STATUS} from "@common/Constants/AppConstants";
import {Customer} from "@store/Models/Customer";

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
            state.lastSequence = action.payload.order.sequence;
            action.payload.order.priorityMark = OrderHelper.calculatePendingOrderPrioritymark(action.payload.order,
                action.payload.customer,
                state.orders.filter(e => e.status === ORDER_STATUS.PLACED));
            state.orders.push(action.payload.order);
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

// Action creators are generated for each case reducer function
export const {add: addOrder, edit: editOrder, remove: removeOrder, reset: resetOrder} = orderSlice.actions

export default orderSlice.reducer
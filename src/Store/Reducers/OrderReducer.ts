import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { Order } from '@store/Models/Order'

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
        add: (state, action: PayloadAction<Order>) => {
            state.lastSequence = action.payload.sequence + 1;
            state.orders.push(action.payload);
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
export const { add: addOrder, edit: editOrder, remove: removeOrder, reset: resetOrder } = orderSlice.actions

export default orderSlice.reducer
import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { Customer } from '@store/Models/Customer'
import {OrderState} from "@store/Reducers/OrderReducer";

export interface CustomerState {
    customers: Customer[];
}

const initialState: CustomerState = {
    customers: []
}

export const customerSlice = createSlice({
    name: 'customer',
    initialState,
    reducers: {
        add: (state, action: PayloadAction<Customer>) => {
            state.customers.push(action.payload);
        },
        edit: (state, action: PayloadAction<Customer>) => {
            state.customers = state.customers.map(e => {
                if (e.id === action.payload.id) return action.payload;
                return e;
            })
        },
        remove: (state, action: PayloadAction<string[]>) => {
            state.customers = state.customers.filter(ingre => !action.payload.includes(ingre.id));
        },
        reset: (state) => {
            state.customers = [];
        },
        setState: (state, action: PayloadAction<CustomerState>) =>{
            state.customers = action.payload.customers;
        }
    },
})

// Action creators are generated for each case reducer function
export const { setState: setCustomerState, add: addCustomer, edit: editCustomer, remove: removeCustomer, reset: resetCustomer } = customerSlice.actions

export default customerSlice.reducer
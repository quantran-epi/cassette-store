import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from 'redux-persist';
import CustomerReducer from "./Reducers/CustomerReducer";
import OrderReducer from "./Reducers/OrderReducer";
import AppContextReducer from "./Reducers/AppContextReducer";
import { idbStorage } from "./idbStorage";

const combinedReducer = combineReducers({
    appContext: AppContextReducer,
    customer: CustomerReducer,
    order: OrderReducer,
})

const persistConfig = {
    key: 'root',
    storage: idbStorage,
}

const persistedReducer = persistReducer(persistConfig, combinedReducer);

export const store = configureStore({
    reducer: persistedReducer,
    devTools: process.env.NODE_ENV !== 'production',
})

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
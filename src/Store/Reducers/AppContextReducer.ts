import {PayloadAction, createSlice} from '@reduxjs/toolkit'

export interface AppContextState {
    loading: boolean;
    currentFeatureName: string;
}

const initialState: AppContextState = {
    loading: false,
    currentFeatureName: ""
}

export const appContextSlice = createSlice({
    name: 'appContext',
    initialState,
    reducers: {
        updateCurrentFeatureName: (state, action: PayloadAction<string>) => {
            state.currentFeatureName = action.payload;
        },
        setState: (state, action: PayloadAction<Partial<AppContextState>>) => {
            state.loading = false;
            state.currentFeatureName = action.payload.currentFeatureName || "";
        }
    }
})

export const {updateCurrentFeatureName, setState: setAppContextState} = appContextSlice.actions

export default appContextSlice.reducer

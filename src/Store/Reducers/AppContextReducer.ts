import {PayloadAction, createSlice} from '@reduxjs/toolkit'

export interface AppContextState {
    loading: boolean;
    currentFeatureName: string;
    codImportIssueCount: number;
    lastCodImportIssueText: string;
}

const initialState: AppContextState = {
    loading: false,
    currentFeatureName: "",
    codImportIssueCount: 0,
    lastCodImportIssueText: ""
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
            state.codImportIssueCount = action.payload.codImportIssueCount || 0;
            state.lastCodImportIssueText = action.payload.lastCodImportIssueText || "";
        },
        setCodImportIssueStatus: (state, action: PayloadAction<{count: number; text: string;}>) => {
            state.codImportIssueCount = Math.max(0, action.payload.count || 0);
            state.lastCodImportIssueText = action.payload.text || "";
        },
        clearCodImportIssueStatus: (state) => {
            state.codImportIssueCount = 0;
            state.lastCodImportIssueText = "";
        }
    }
})

export const {
    updateCurrentFeatureName,
    setState: setAppContextState,
    setCodImportIssueStatus,
    clearCodImportIssueStatus
} = appContextSlice.actions

export default appContextSlice.reducer

import { configureStore } from "@reduxjs/toolkit";
import uiReducer from './slices/uiSlice'
import filtersReducer from './slices/filtersSlice'


export const store = configureStore({
    reducer: {
        ui: uiReducer,
        filters: filtersReducer,
    }
})

export default store
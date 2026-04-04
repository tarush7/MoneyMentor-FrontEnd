import { configureStore } from "@reduxjs/toolkit";
import uiReducer from './slices/uiSlice'
import filtersReducer from './slices/filtersSlice'
import loginReducer from './slices/loginSlice'


export const store = configureStore({
    reducer: {
        ui: uiReducer,
        filters: filtersReducer,
        login: loginReducer,
    }
})

export default store

import { createSlice } from "@reduxjs/toolkit"


const initialState = {
    selectedTransactionID: null,
    isTransactionModalOpen: false,
}

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        openTransactionModal: (state, action) => {
            state.selectedTransactionID = action.payload
            state.isTransactionModalOpen = true
        },
        closeTransactionModal: (state) => {
            state.selectedTransactionID = null
            state.isTransactionModalOpen = false
        },
    },
})

export const { openTransactionModal, closeTransactionModal } = uiSlice.actions
export default uiSlice.reducer

import { createSlice } from "@reduxjs/toolkit"


const initialState = {
    selectedTransactionId: null,
    isTransactionModalOpen: false,
}

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        openTransactionModal: (state, action) => {
            state.selectedTransactionId = action.payload
            state.isTransactionModalOpen = true
        },
        closeTransactionModal: (state) => {
            state.selectedTransactionId = null
            state.isTransactionModalOpen = false
        },
    },
})

export const { openTransactionModal, closeTransactionModal } = uiSlice.actions
export default uiSlice.reducer

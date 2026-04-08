import { createSlice } from "@reduxjs/toolkit"


const initialState = {
    selectedTransactionId: null,
    isTransactionModalOpen: false,
    transactionModalView: 'categorize',
}

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        openTransactionModal: (state, action) => {
            const payload =
                typeof action.payload === 'object' && action.payload !== null
                    ? action.payload
                    : { transactionId: action.payload, view: 'categorize' }

            state.selectedTransactionId = payload.transactionId
            state.transactionModalView =
                payload.view === 'manage' ? 'manage' : 'categorize'
            state.isTransactionModalOpen = true
        },
        closeTransactionModal: (state) => {
            state.selectedTransactionId = null
            state.isTransactionModalOpen = false
            state.transactionModalView = 'categorize'
        },
    },
})

export const { openTransactionModal, closeTransactionModal } = uiSlice.actions
export default uiSlice.reducer

import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  isLoginModalOpen: false,
}

const loginSlice = createSlice({
  name: 'login',
  initialState,
  reducers: {
    openLoginModal: (state) => {
      state.isLoginModalOpen = true
    },
    closeLoginModal: (state) => {
      state.isLoginModalOpen = false
    },
    toggleLoginModal: (state) => {
      state.isLoginModalOpen = !state.isLoginModalOpen
    },
  },
})

export const { openLoginModal, closeLoginModal, toggleLoginModal } = loginSlice.actions
export default loginSlice.reducer

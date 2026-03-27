import { createSlice } from "@reduxjs/toolkit"


const initialState = {
    page: 1,
    pageSize: 10,
}

const FiltersSlice = createSlice({
    name: 'filters',
    initialState,
    reducers: {
        setPage: (state, action) => {
            state.page = action.payload
        },
        setPageSize: (state, action) => {
            state.pageSize = action.payload
            state.page = 1
        },
        resetPagination: (state) => {
           state.page = 1
        },
    },
})

export const { setPage, setPageSize, resetPagination } = FiltersSlice.actions
export default FiltersSlice.reducer
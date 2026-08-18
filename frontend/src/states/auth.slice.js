import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
    name: "auth",
    initialState: {
        user: null,
        loading: false,
        error: null
    },
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload
        },
        setloading: (state, action) => {
            state.loading = action.payload
        },
        setError: (state, action) => {
            state.error = action.payload
        },
    }
})


export const { setError, setUser, setloading } = authSlice.actions
export default authSlice.reducer
import { configureStore } from "@reduxjs/toolkit";
import authReducers from '../states/auth.slice.js'

export const store = configureStore({
  reducer: {
    auth: authReducers
  },
});

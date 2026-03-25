import { configureStore } from "@reduxjs/toolkit";
import authReducer from '../authSlice';  // fixed: was '../authSlice' — same folder

export const store = configureStore({
    reducer: {
        auth: authReducer
    }
});
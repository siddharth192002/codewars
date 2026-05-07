import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosClient from './utils/axiosClient';

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post('/user/register', userData);
      return response.data.user;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message || 'Network error');
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post('/user/login', credentials);
      return response.data.user;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message || 'Network error');
    }
  }
);

export const checkUser = createAsyncThunk(
  'auth/check',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.get('/user/check');
      return data.user;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message || 'Network error');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await axiosClient.post('/user/logout');
      return null;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message || 'Network error');
    }
  }
);

// Helper: backend returns { error: "..." } — extract the message string
const extractError = (payload) =>
  payload?.error || payload?.message || payload || 'Something went wrong';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // register
      .addCase(registerUser.pending,   (state) => { state.loading = true; state.error = null; })
      .addCase(registerUser.fulfilled, (state, action) => { state.loading = false; state.isAuthenticated = !!action.payload; state.user = action.payload; })
      .addCase(registerUser.rejected,  (state, action) => { state.loading = false; state.error = extractError(action.payload); })

      // login
      .addCase(loginUser.pending,   (state) => { state.loading = true; state.error = null; })
      .addCase(loginUser.fulfilled, (state, action) => { state.loading = false; state.isAuthenticated = !!action.payload; state.user = action.payload; })
      .addCase(loginUser.rejected,  (state, action) => { state.loading = false; state.error = extractError(action.payload); })

      // check
      .addCase(checkUser.pending,   (state) => { state.loading = true; state.error = null; })
      .addCase(checkUser.fulfilled, (state, action) => { state.loading = false; state.isAuthenticated = !!action.payload; state.user = action.payload; })
      .addCase(checkUser.rejected,  (state) => { state.loading = false; state.isAuthenticated = false; state.user = null; state.error = null; })

      // logout
      .addCase(logoutUser.fulfilled, (state) => { state.loading = false; state.isAuthenticated = false; state.user = null; state.error = null; })
      .addCase(logoutUser.rejected,  (state, action) => { state.loading = false; state.error = extractError(action.payload); });
  }
});

export default authSlice.reducer;
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/axios';
import { isTokenValid } from '../../utils';

export const login = createAsyncThunk('auth/login', async (data, { rejectWithValue }) => {
  try {
    const res = await API.post('/auth/login', data);
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data));
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Login failed');
  }
});

export const register = createAsyncThunk('auth/register', async (data, { rejectWithValue }) => {
  try {
    const res = await API.post('/auth/register', data);
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data));
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Registration failed');
  }
});

const storedToken = localStorage.getItem('token');
const storedUser = localStorage.getItem('user');
const initialState = {
  user: storedToken && isTokenValid(storedToken) && storedUser ? JSON.parse(storedUser) : null,
  token: storedToken && isTokenValid(storedToken) ? storedToken : null,
  loading: false,
  error: null,
};

if (!isTokenValid(storedToken)) {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(login.fulfilled, (state, action) => { state.loading = false; state.user = action.payload; state.token = action.payload.token; })
      .addCase(login.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(register.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(register.fulfilled, (state, action) => { state.loading = false; state.user = action.payload; state.token = action.payload.token; })
      .addCase(register.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;

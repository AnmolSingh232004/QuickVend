import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/axios';

export const fetchOrders = createAsyncThunk('orders/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const res = await API.get('/orders');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to fetch orders');
  }
});

export const checkout = createAsyncThunk('orders/checkout', async ({ shippingAddress, couponCode }, { rejectWithValue }) => {
  try {
    const res = await API.post('/orders/checkout', { shippingAddress, couponCode });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Checkout failed');
  }
});

export const checkoutCOD = createAsyncThunk('orders/checkoutCOD', async ({ shippingAddress, couponCode }, { rejectWithValue }) => {
  try {
    const res = await API.post('/orders/cod', { shippingAddress, couponCode });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'COD checkout failed');
  }
});

export const createRazorpayOrder = createAsyncThunk('orders/createRazorpayOrder', async (_, { rejectWithValue }) => {
  try {
    const res = await API.post('/orders/create-razorpay-order');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to create payment order');
  }
});

export const verifyPayment = createAsyncThunk('orders/verifyPayment', async (data, { rejectWithValue }) => {
  try {
    const res = await API.post('/orders/verify-payment', data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Payment verification failed');
  }
});

export const cancelOrder = createAsyncThunk('orders/cancel', async (orderId, { rejectWithValue }) => {
  try {
    const res = await API.post(`/orders/${orderId}/cancel`);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to cancel order');
  }
});

const initialState = {
  orders: [],
  currentOrder: null,
  loading: false,
  razorpayLoading: false,
  error: null,
};

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearCurrentOrder(state) { state.currentOrder = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => { state.loading = true; })
      .addCase(fetchOrders.fulfilled, (state, action) => { state.loading = false; state.orders = action.payload; })
      .addCase(fetchOrders.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(checkout.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(checkout.fulfilled, (state, action) => { state.loading = false; state.currentOrder = action.payload; })
      .addCase(checkout.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(checkoutCOD.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(checkoutCOD.fulfilled, (state, action) => { state.loading = false; state.currentOrder = action.payload; })
      .addCase(checkoutCOD.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(createRazorpayOrder.pending, (state) => { state.razorpayLoading = true; state.error = null; })
      .addCase(createRazorpayOrder.fulfilled, (state) => { state.razorpayLoading = false; })
      .addCase(createRazorpayOrder.rejected, (state, action) => { state.razorpayLoading = false; state.error = action.payload; })
      .addCase(verifyPayment.pending, (state) => { state.razorpayLoading = true; state.error = null; })
      .addCase(verifyPayment.fulfilled, (state, action) => { state.razorpayLoading = false; state.currentOrder = action.payload; })
      .addCase(verifyPayment.rejected, (state, action) => { state.razorpayLoading = false; state.error = action.payload; })
      .addCase(cancelOrder.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.orders.findIndex((o) => o.id === action.payload.id);
        if (idx >= 0) state.orders[idx] = action.payload;
      })
      .addCase(cancelOrder.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export const { clearCurrentOrder } = orderSlice.actions;
export default orderSlice.reducer;

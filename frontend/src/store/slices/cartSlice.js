import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/axios';

export const fetchCart = createAsyncThunk('cart/fetch', async (_, { rejectWithValue }) => {
  try {
    const res = await API.get('/cart');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to fetch cart');
  }
});

export const addToCart = createAsyncThunk('cart/add', async ({ productId, quantity }, { rejectWithValue }) => {
  try {
    const res = await API.post(`/cart/add/${productId}`, { quantity });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to add to cart');
  }
});

export const updateCartItem = createAsyncThunk('cart/update', async ({ itemId, quantity }, { rejectWithValue }) => {
  try {
    const res = await API.put(`/cart/item/${itemId}`, { quantity });
    return { itemId, data: res.data };
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to update cart');
  }
});

export const removeCartItem = createAsyncThunk('cart/remove', async (itemId, { rejectWithValue }) => {
  try {
    await API.delete(`/cart/item/${itemId}`);
    return itemId;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to remove item');
  }
});

export const clearCart = createAsyncThunk('cart/clear', async (_, { rejectWithValue }) => {
  try {
    await API.delete('/cart');
    return [];
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to clear cart');
  }
});

const initialState = {
  items: [],
  loading: false,
  error: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    resetCart(state) {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => { state.loading = true; })
      .addCase(fetchCart.fulfilled, (state, action) => { state.loading = false; state.items = action.payload; })
      .addCase(fetchCart.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(addToCart.fulfilled, (state, action) => {
        const idx = state.items.findIndex(i => i.productId === action.payload.productId);
        if (idx >= 0) state.items[idx] = action.payload;
        else state.items.push(action.payload);
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        if (action.payload.data) {
          const idx = state.items.findIndex(i => i.id === action.payload.itemId);
          if (idx >= 0) state.items[idx] = action.payload.data;
        } else {
          state.items = state.items.filter(i => i.id !== action.payload.itemId);
        }
      })
      .addCase(removeCartItem.fulfilled, (state, action) => {
        state.items = state.items.filter(i => i.id !== action.payload);
      })
      .addCase(clearCart.fulfilled, (state) => { state.items = []; });
  },
});

export const { resetCart } = cartSlice.actions;
export default cartSlice.reducer;

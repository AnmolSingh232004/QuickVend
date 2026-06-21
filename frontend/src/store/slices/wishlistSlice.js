import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/axios';

export const fetchWishlist = createAsyncThunk('wishlist/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const res = await API.get('/wishlist');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to load wishlist');
  }
});

export const addToWishlist = createAsyncThunk('wishlist/add', async (productId, { rejectWithValue }) => {
  try {
    const res = await API.post('/wishlist', { productId });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to add to wishlist');
  }
});

export const removeFromWishlist = createAsyncThunk('wishlist/remove', async (productId, { rejectWithValue }) => {
  try {
    await API.delete(`/wishlist/${productId}`);
    return productId;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to remove from wishlist');
  }
});

const initialState = {
  items: [],
  loading: false,
  error: null,
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (state) => { state.loading = true; })
      .addCase(fetchWishlist.fulfilled, (state, action) => { state.loading = false; state.items = action.payload; })
      .addCase(fetchWishlist.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(addToWishlist.fulfilled, (state, action) => { state.items.unshift(action.payload); })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.items = state.items.filter((i) => i.productId !== action.payload);
      });
  },
});

export default wishlistSlice.reducer;

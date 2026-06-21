import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/axios';

export const fetchProducts = createAsyncThunk('products/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const res = await API.get('/products', { params });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to fetch products');
  }
});

export const fetchProductById = createAsyncThunk('products/fetchById', async (id, { rejectWithValue }) => {
  try {
    const res = await API.get(`/products/${id}`);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to fetch product');
  }
});

export const fetchCategories = createAsyncThunk('products/fetchCategories', async (_, { rejectWithValue }) => {
  try {
    const res = await API.get('/categories');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to fetch categories');
  }
});

const initialState = {
  products: [],
  selectedProduct: null,
  categories: [],
  loading: false,
  error: null,
  totalPages: 0,
  currentPage: 0,
  totalElements: 0,
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        if (Array.isArray(action.payload)) {
          state.products = action.payload;
          state.totalPages = 0;
          state.currentPage = 0;
          state.totalElements = action.payload.length;
        } else {
          state.products = action.payload.content || [];
          state.totalPages = action.payload.totalPages || 0;
          state.currentPage = action.payload.page || 0;
          state.totalElements = action.payload.totalElements || 0;
        }
      })
      .addCase(fetchProducts.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchProductById.pending, (state) => { state.loading = true; })
      .addCase(fetchProductById.fulfilled, (state, action) => { state.loading = false; state.selectedProduct = action.payload; })
      .addCase(fetchProductById.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchCategories.fulfilled, (state, action) => { state.categories = action.payload; });
  },
});

export default productSlice.reducer;

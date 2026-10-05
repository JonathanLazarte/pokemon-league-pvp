import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { createSelector } from 'reselect';
import { apiFetch, getAuthToken } from '../../services/api.js';

export const getUserItems = createAsyncThunk(
  'userItems/getUserItems',
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiFetch('pokemons/users/getItems', {
        method: 'POST',
        body: JSON.stringify({ userID: id || getAuthToken() }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user items');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const buyItem = createAsyncThunk(
  'userItems/buyItem',
  async (props, { rejectWithValue }) => {
    try {
      const response = await apiFetch('pokemons/users/buyItem', {
        method: 'POST',
        body: JSON.stringify(props),
      });

      if (!response.ok) {
        throw new Error('Failed to buy item');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const consumeItem = createAsyncThunk(
  'userItems/consumeItem',
  async ({ itemId, pokemonIndex }, { rejectWithValue }) => {
    try {
      const pokeballsState = [{ index: pokemonIndex, itemId }];
      const response = await apiFetch('pokemons/users/updatelevel', {
        method: 'POST',
        body: JSON.stringify({
          userId: getAuthToken(),
          pokeballsState,
          pokemonExp: 0,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to consume item');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  loading: false,
  items: [],
  error: '',
};

const userItemsSlice = createSlice({
  name: 'userItems',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getUserItems.pending, (state) => {
        state.loading = true;
        state.error = '';
      })
      .addCase(getUserItems.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload || [];
      })
      .addCase(getUserItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Something went wrong';
      })
      .addCase(buyItem.pending, (state) => {
        state.loading = true;
        state.error = '';
      })
      .addCase(buyItem.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.items.push(action.payload);
        }
      })
      .addCase(buyItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Something went wrong';
      })
      .addCase(consumeItem.pending, (state) => {
        state.loading = true;
        state.error = '';
      })
      .addCase(consumeItem.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(consumeItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Something went wrong';
      });
  },
});

export const selectUserItemsState = (state) => state.userItems;
export const selectUserItems = (state) => state.userItems.items;
export const selectUserItemsLoading = (state) => state.userItems.loading;
export const selectUserItemsError = (state) => state.userItems.error;

export const selectUserItemsData = createSelector(
  [selectUserItems, selectUserItemsLoading, selectUserItemsError],
  (userItems, loading, error) => ({
    userItems,
    loading,
    error,
  })
);

export default userItemsSlice.reducer;
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { createSelector} from 'reselect';

const {VITE_API_URL : API_URL} = import.meta.env;

export const getUserItems = createAsyncThunk(
  'userItems/getUserItems',
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}pokemons/users/getItems`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userID: id }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch Pokémon');
      }

      const data = await response.json();
      return data; // Return the data to be used in the reducer
    } catch (error) {
      return rejectWithValue(error.message); // Handle errors
    }
  }
);
export const buyItem = createAsyncThunk(
  'userItems/buyItem',
  async ( props, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}pokemons/users/buyItem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(props),
      });

      if (!response.ok) {
        throw new Error('Failed to buy item');
      }

      const data = await response.json();
      return data; // Return the data to be used in the reducer

    } catch (error) {
      return rejectWithValue(error.message); // Handle errors
    }
  }
);
export const consumeItem = createAsyncThunk(
  'userItems/consumeItem',
  async( {itemId, pokemonIndex}, { rejectWithValue })=>{
    try{   
      response = await fetch(`${API_URL}pokemons/users/updatelevel`,{
        method: 'POST',
        headers: {'Content-Type' : 'application/json'},
        body: JSON.stringify({
          userId : token,
          pokeballsState,
          pokemonExp : 0
        })
      })

      if(!response.ok){
        throw new Error('Failed to consume item')
      }

      data = await response.json()
      return data

    } catch(error){
      return rejectWithValue(error.message)
    }
  }
)
const initialState = {
  loading: false,
  items: [],
  error: "",
};


const userItemsSlice = createSlice({
  name: 'userItems',
  initialState,
  reducers: {
    buyItem: (state, action) => {

    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUserItems.pending, (state) => {
        state.loading = true;
        state.error = ''; // Clear any previous errors
      })
      .addCase(getUserItems.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload; // Update state with fetched Items
      })
      .addCase(getUserItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Something went wrong'; // Set error message
      })
      .addCase(buyItem.pending, (state) => {
        state.loading = true;
        state.error = ''; // Clear any previous errors
      })
      .addCase(buyItem.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload; // Update state with fetched Items
      })
      .addCase(buyItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Something went wrong'; // Set error message
      })
      .addCase(consumeItem.pending, (state) => {
        state.loading = true;
        state.error = ''; // Clear any previous errors
      })
      .addCase(consumeItem.fulfilled, (state, action) => {
        state.loading = false;
        //state.items = action.payload; // Update state with fetched Items
      })
      .addCase(consumeItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Something went wrong'; // Set error message
      });
  },
})

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
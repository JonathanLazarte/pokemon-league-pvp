import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { createSelector } from 'reselect';
import { apiFetch, getAuthToken } from '../../services/api.js';

export const getUserPokemon = createAsyncThunk(
  'userPokemon/getUserPokemon',
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiFetch('pokemons/users/pokemon', {
        method: 'POST',
        body: JSON.stringify({ id: id || getAuthToken() }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch Pokémon');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addPokemon = createAsyncThunk(
  'userPokemon/addPokemon',
  async ({ pokemonId, coin, price, pokemonName = '' }, { rejectWithValue }) => {
    try {
      const body = {
        userID: getAuthToken(),
        pokemonID: pokemonId,
        pokemonName,
        coin,
        price,
      };
      const response = await apiFetch('pokemons/users/addpokemon', {
        method: 'POST',
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error('Failed to add Pokémon');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updatePokemon = createAsyncThunk(
  'userPokemon/updatePokemon',
  async (props, { rejectWithValue }) => {
    const pokeballsState = [props];

    try {
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

export const sellPokemon = createAsyncThunk(
  'userPokemon/sellPokemon',
  async ({ pokemonId }, { rejectWithValue }) => {
    try {
      const body = {
        userId: getAuthToken(),
        pokemonIndex: pokemonId,
      };
      const response = await apiFetch('pokemons/users/sellpokemon', {
        method: 'POST',
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error('Failed to sell Pokémon');
      }

      const data = await response.json();
      return { ...data, pokemonIndex: pokemonId };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  loading: false,
  pokemon: [],
  error: '',
};

const userPokemonSlice = createSlice({
  name: 'userPokemon',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getUserPokemon.pending, (state) => {
        state.loading = true;
        state.error = '';
      })
      .addCase(getUserPokemon.fulfilled, (state, action) => {
        state.loading = false;
        state.pokemon = action.payload || [];
      })
      .addCase(getUserPokemon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Something went wrong';
      })
      .addCase(addPokemon.pending, (state) => {
        state.loading = true;
        state.error = '';
      })
      .addCase(addPokemon.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.pokemon.push(action.payload);
        }
      })
      .addCase(addPokemon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Something went wrong';
      })
      .addCase(updatePokemon.pending, (state) => {
        state.loading = true;
        state.error = '';
      })
      .addCase(updatePokemon.fulfilled, (state, action) => {
        state.loading = false;
        if (Array.isArray(action.payload)) {
          state.pokemon = state.pokemon.map((p) => {
            const updated = action.payload.find((up) => up.index === p.index);
            return updated ? { ...updated } : p;
          });
        }
      })
      .addCase(updatePokemon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Something went wrong';
      })
      .addCase(sellPokemon.pending, (state) => {
        state.loading = true;
        state.error = '';
      })
      .addCase(sellPokemon.fulfilled, (state, action) => {
        state.loading = false;
        state.pokemon = state.pokemon.filter((p) => p.index !== action.payload.pokemonIndex);
      })
      .addCase(sellPokemon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Something went wrong';
      });
  },
});

export const selectUserPokemonState = (state) => state.userPokemon;
export const selectUserPokemon = (state) => state.userPokemon.pokemon;
export const selectUserPokemonLoading = (state) => state.userPokemon.loading;
export const selectUserPokemonError = (state) => state.userPokemon.error;

export const selectUserPokemonData = createSelector(
  [selectUserPokemon, selectUserPokemonLoading, selectUserPokemonError],
  (userPokemon, loading, error) => ({
    userPokemon,
    loading,
    error,
  })
);

export default userPokemonSlice.reducer;
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { createSelector } from 'reselect';

const {VITE_API_URL : API_URL} = import.meta.env;
const token = localStorage.getItem("token");

export const getUserPokemon = createAsyncThunk(
  'userPokemon/getUserPokemon',
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}pokemons/users/pokemon`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
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
export const addPokemon = createAsyncThunk(
  'userPokemon/addPokemon',
  async ({pokemonId, coin, price}, { rejectWithValue }) => {
    try {
      const body = {
            userID : token,
            pokemonID : pokemonId,
            pokemonName : ""/*window.prompt("Nombra a tu pokemon")*/,
            coin,
            price
      }
      const response = await fetch(`${API_URL}pokemons/users/addpokemon`,{
            method:'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify(body),
      })

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
export const updatePokemon = createAsyncThunk(
  'userPokemon/updatePokemon',
  async( props, { rejectWithValue })=>{
    const pokeballsState = [
      props
    ]
    const token = localStorage.getItem("token");
      
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
export const sellPokemon = createAsyncThunk(
  'userPokemon/sellPokemon',
  async ({pokemonId}, { rejectWithValue }) => {
    try {
      const body = {
            userId : token,
            pokemonIndex : pokemonId,
      }
      const response = await fetch(`${API_URL}pokemons/users/sellpokemon`,{
            method:'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify(body),
      })

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
const initialState = {
  loading: false,
  pokemon: [],
  error: "",
};


const userPokemonSlice = createSlice({
  name: 'userPokemon',
  initialState,
  reducers: {
    sellPokemon: (state, action) => {

    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUserPokemon.pending, (state) => {
        state.loading = true;
        state.error = ''; // Clear any previous errors
      })
      .addCase(getUserPokemon.fulfilled, (state, action) => {
        state.loading = false;
        state.pokemon = action.payload; // Update state with fetched Pokémon
      })
      .addCase(getUserPokemon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Something went wrong'; // Set error message
      })
      .addCase(addPokemon.pending, (state) => {
        state.loading = true;
        state.error = ''; // Clear any previous errors
      })
      .addCase(addPokemon.fulfilled, (state, action) => {
        const updatedPokemon = state.pokemon;
        updatedPokemon.push(action.payload);
        state.pokemon = updatedPokemon;
        state.loading = false;
      })
      .addCase(addPokemon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Something went wrong'; // Set error message
      })
      .addCase(updatePokemon.pending, (state) => {
        state.loading = true;
        state.error = ''; // Clear any previous errors
      })
      .addCase(updatePokemon.fulfilled, (state, action) => {
        const updatedPokemon = state.pokemonStore.map((pokemon, index) => {
          if (action.payload.some(p=> p.index == pokemon.index)) {

            const index = action.payload.findIndex(p=> p.index == pokemon.index)
            return { ...action.payload[index] };

          }

          return pokemon

        });
        state.loading = false;
        state.pokemon = updatePokemon; // Update state with fetched Pokémon
      })
      .addCase(updatePokemon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Something went wrong'; // Set error message
      })
    .addCase(sellPokemon.pending, (state) => {
        state.loading = true;
        state.error = ''; // Clear any previous errors
      })
      .addCase(sellPokemon.fulfilled, (state, action) => {
        const updatedPokemon = [...state.pokemon];
        const pokemonToDeleteIndex = state.pokemon.findIndex(pokemon=>pokemon.index == action.payload.pokemonIndex)
        updatedPokemon.splice(pokemonToDeleteIndex, 1);
        state.pokemon = updatedPokemon;
        state.loading = false;
      })
      .addCase(sellPokemon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Something went wrong'; // Set error message
      });
  },
})

export const selectUserPokemonState = (state) => state.userPokemon;
export const selectUserPokemon = (state) => state.userPokemon.pokemon;
export const selectUserPokemonLoading = (state) => state.userPokemon.loading;
export const selectUserPokemonError = (state) => state.userPokemon.error;

// Selector memoizado para combinar partes del estado
export const selectUserPokemonData = createSelector(
  [selectUserPokemon, selectUserPokemonLoading, selectUserPokemonError],
  (userPokemon, loading, error) => ({
    userPokemon,
    loading,
    error,
  })
);

export default userPokemonSlice.reducer;


/*
export const addPokemon = (data) => async dispatch =>{
	dispatch(pokemonAdd(data)) 
}

export const healPokemon = (index, hp) => async dispatch =>{
		const pokeballsState = [{
      	index,
      	hp : undefined//20//renderData.stats[0].actual_stat
    }]
		fetch(`${API_URL}pokemons/users/updatelevel`,{
        method: 'POST',
        headers: {'Content-Type' : 'application/json'},
        body: JSON.stringify({
          userId : token,
          pokeballsState,
          pokemonExp : 0
        })
      }).then(response => response.json()).then(data=>{
      	dispatch(pokemonUpdate(data.updatedPokemon))
    		}).catch(error => dispatch(pokemonFailure(error)))
	
	}

export const sellPokemon = (pokemonIndex) => async dispatch =>{

		await fetch(`${API_URL}pokemons/users/sellpokemon`,{
        method: 'POST',
        headers: {'Content-Type' : 'application/json'},
        body: JSON.stringify({
          userId : token,
          pokemonIndex: pokemonIndex,
        })
      }).then(response => response.json()).then(data=> dispatch(pokemonSuccess(data)) )
	
		}

export const increasePokemonEffort = (data) => async dispatch =>{
		const pokeballsState = [data]
		await fetch(`${API_URL}pokemons/users/updatelevel`,{
        method: 'POST',
        headers: {'Content-Type' : 'application/json'},
        body: JSON.stringify({
          userId : token,
          pokeballsState,
          pokemonExp : 0
        })
      }).then(response => response.json()).then(data=>{
      	dispatch(pokemonUpdate(data.updatedPokemon))
    		})
	
	}
export const consumeItem = (itemId, pokemonIndex) => dispatch =>{
		switch (itemId) {
  case 23:
    dispatch(healPokemon(pokemonIndex))
    break;
  case 45:
    dispatch(increasePokemonEffort({index: pokemonIndex, hp_effort: 50}))
    break;
  case 46:
    dispatch(increasePokemonEffort({index: pokemonIndex, attack_effort: 50}))
    break;
  case 47:
    dispatch(increasePokemonEffort({index: pokemonIndex, defense_effort: 50}))
    break;
  case 48:
    dispatch(increasePokemonEffort({index: pokemonIndex, special_attack_effort: 50}))
    break;
  case 49:
    dispatch(increasePokemonEffort({index: pokemonIndex, special_defense_effort: 50}))
    break;
  case 52:
    dispatch(increasePokemonEffort({index: pokemonIndex, speed_effort: 50}))
    break;
  default:
    //Declaraciones ejecutadas cuando ninguno de los valores coincide con el valor de la expresión
    break;
}
}

export const updatePokemon = (data) => dispatch=>{
  dispatch(pokemonUpdate(data))
}

*/
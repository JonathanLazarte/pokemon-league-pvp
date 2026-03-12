import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import pokemonReducer from './slices/userPokemonSlice';
import itemsReducer from './slices/userItemsSlice';
import interfaceReducer from './slices/userInterfaceSlice'

const store = configureStore({
  reducer: {
    user: userReducer,
    userPokemon: pokemonReducer,
    userItems: itemsReducer,
    userInterface: interfaceReducer,
  },
});

export default store;
import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import pokemonReducer from './../store/reducers/pokemonReducer.js'

const store = configureStore({
  reducer: {
    user: userReducer,
    pokemonReducer
  },
});

export default store;
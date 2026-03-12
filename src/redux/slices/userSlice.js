import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  userName: '',
  password: '',
  id: '',
  alias: '',
  tag: '',
  title: '',
  pokemon: [],
  items: [],
  messages: [],
  level: 1,
  EXP: 0,
  BE: 20000,
  RP: 3000,
  rank: {},
  profileIcon: '',
  background: '',
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.userName = action.payload.userName;
      state.id = action.payload.id;
      state.alias = action.payload.userName;
      state.tag = action.payload.tag;
      state.title = action.payload.title;
      state.level = action.payload.level;
      state.EXP = action.payload.EXP;
      state.BE = action.payload.BE;
      state.RP = action.payload.RP;
      state.profileIcon = action.payload.profileIcon;
      state.background = action.payload.profileIcon;
      state.rank = action.payload.rank;
      state.messages = action.payload.messages;
    },
    updateUser: (state, action) => {
      // Aquí puedes añadir reducers para actualizar otros campos del usuario
      // Por ejemplo:
      // state.level = action.payload.level;
      // state.EXP = action.payload.EXP;
    },
    setUserMessages: (state, action) => {
      const newMessages = [...state.messages, action.payload];
      state.messages = newMessages;
    },
    updateCoins: (state, action) => {
      state.RP = action.payload.coin == "RP" ? state.RP - action.payload.price : state.RP;
      state.BE = action.payload.coin == "BE" ? state.BE - action.payload.price : state.BE;
    }
  },
});

export const { setUser, updateUser, setUserMessages, updateCoins } = userSlice.actions;
export default userSlice.reducer;
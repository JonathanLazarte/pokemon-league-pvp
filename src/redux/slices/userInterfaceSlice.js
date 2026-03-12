import { createSlice } from '@reduxjs/toolkit'
import { createSelector } from 'reselect'

const initialState = {
	userState: 'Online',
	actualSection : 'Home',
	isPlayButtonSelected : false,

}

const userInterfaceSlice = createSlice({
	name: 'userInterface',
	initialState,
	reducers: {
		setIsPlayButtonSelected : (state, action) => {
			isPlayButtonSelected = action.payload;
		},
		setActualSection : (state, action) => {
			state.actualSection = action.payload;
		},
		setUserState : (state, action) => {
			state.userState = action.payload;
		}
	}
})

export const { setIsPlayButtonSelected, setActualSection, setUserState } = userInterfaceSlice.actions;

export const selectUserInterfaceIsPlayButtonSelected = (state) => state.userInterface.isPlayButtonSelected;
export const selectUserInterfaceActualSection = (state) => state.userInterface.actualSection;
export const selectUserInterfaceState = (state) => state.userInterface.userState;

export const selectUserInterfaceData = createSelector(
	[selectUserInterfaceState, selectUserInterfaceActualSection, selectUserInterfaceIsPlayButtonSelected],
	(userState, actualSection, isPlayButtonSelected) => ({
		userState,
		actualSection,
		isPlayButtonSelected,
	}))

export default userInterfaceSlice.reducer
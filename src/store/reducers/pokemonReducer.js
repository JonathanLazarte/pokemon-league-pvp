import {POKEMON_REQUEST, POKEMON_SUCCESS, POKEMON_FAILURE, POKEMON_UPDATE, POKEMON_ADD, ADD_ITEM} from '../types.js'

const initialState = {
	loading: false,
	pokemonStore: [],
	items: [],
	error: "",
}

const pokemonReducer = (state = initialState, action) =>{
	switch(action.type){
		case POKEMON_REQUEST: return{
		...state,
		loading : true
		}
		case POKEMON_SUCCESS: return{
		loading : false,
		pokemonStore : action.payload.pokemon,
		items: action.payload.items,
		}
		case POKEMON_FAILURE: return{
		loading : false,
		pokemonStore : {},
		items: {},
		error : action.payload
		}
		case POKEMON_UPDATE:
			const updatedPokemon = state.pokemonStore.map((pokemon, index) => {
	    if (action.payload.some(p=> p.index == pokemon.index)) {
	    const index = action.payload.findIndex(p=> p.index == pokemon.index)
	    return { ...action.payload[index] };        }
	    return pokemon
	    });
    return {
    loading: false,
    pokemonStore: updatedPokemon, 
    items: state.items 
    };
    case POKEMON_ADD:
    	const updatedPokemonStore = state.pokemonStore
    	updatedPokemonStore.push(action.payload)
    return {
    ...state,
    pokemonStore : updatedPokemonStore
    }
    case ADD_ITEM: return{
      	...state,
      	items: action.payload
    }
		default : return state 
	}
}
export default pokemonReducer
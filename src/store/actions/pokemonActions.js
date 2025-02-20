import {POKEMON_REQUEST, POKEMON_SUCCESS, POKEMON_FAILURE, POKEMON_UPDATE, POKEMON_ADD, ADD_ITEM} from '../types.js';

export const pokemonRequest = ()=>({
	type: POKEMON_REQUEST,
})

export const pokemonSuccess = data=>({
	type: POKEMON_SUCCESS,
	payload: data,
})
export const pokemonFailure = error=>({
	type: POKEMON_FAILURE,
	payload: error,
})
export const pokemonUpdate = data=>({
	type: POKEMON_UPDATE,
	payload: data,
})
export const pokemonAdd = data=>({
	type: POKEMON_ADD,
	payload: data,
})
export const itemAdd = data=>({
	type: ADD_ITEM,
	payload: data,
})

const {VITE_API_URL : API_URL} = import.meta.env;
const token = localStorage.getItem("token");

export const getPokemon = (path) => dispatch =>{
	dispatch(pokemonRequest())
	fetch(`${API_URL}pokemons/${path}`,{
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ id : token })
        })
    	.then(response => response.json())
    	.then(data => dispatch(pokemonSuccess(data)) )
    	.catch(error => dispatch(pokemonFailure(error)) )

}

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

export const addItem = (data) => dispatch =>{
	dispatch(itemAdd(data))
}

export const updatePokemon = (data) => dispatch=>{
  dispatch(pokemonUpdate(data))
}


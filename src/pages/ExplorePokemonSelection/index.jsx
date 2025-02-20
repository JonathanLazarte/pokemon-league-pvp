import './styles.css'
import BattleField from '../../pages/Battlefield/index.jsx'
import PokemonList from '../../components/pokemonList/pokemonList.jsx'
import react, {useState, useEffect, useRef, memo} from 'react'
import {io} from 'https://cdn.socket.io/4.8.0/socket.io.esm.min.js'
import { v4 as uuidv4 } from 'uuid';
import {useSelector, /*useDispatch*/} from 'react-redux'



export default memo(function ExplorePokemonSelection({}){
    const {VITE_API_URL : API_URL} = import.meta.env;
	  const [renderData, setRenderData] = useState([])
  	const [renderPokeballsOne, setRenderPokeballsOne] = useState([null,null,null])
  	const [renderPokeballsTwo, setRenderPokeballsTwo] = useState([null,null,null])
	  const [pokemonOne, setPokemonOne] = useState()
  	const [pokemonTwo, setPokemonTwo] = useState()
  	const [currentPlayer, setCurrentPlayer] = useState("One")
  	const [types, setTypes] = useState([])
  	const token = localStorage.getItem('token')
    const {loading, pokemonStore, error} = useSelector(state => {return state.pokemonReducer})
    //const userName = localStorage.getItem('userName')

    //const socket = s//io(`${API_URL}`,{ auth: {token}})
   

  	useEffect(() => {
 // dispatch(getPokemon(''))
  Promise.all([
    fetch(`${API_URL}pokemons/data/types`),
    //fetch(`${API_URL}pokemons/users/pokemon`,{method: 'POST', headers: {'Content-Type':'application/json'}, body:JSON.stringify({id : token})}),
  ])
  .then(([response1, response2]) => {
    Promise.all([response1.json(), /*response2.json()*/])
    .then(([data1, data2]) => {    
      setTypes(data1.types);
      //setRenderData(data2);
    });
  });
}, []);


  const selectPokemon = (pokemonIndex)=>{
  const renderPokeballs = renderPokeballsOne;
  const setRenderPokeballs = setRenderPokeballsOne;
  const renderDataIndex = pokemonStore.findIndex(poke => poke?.index == pokemonIndex)
  const pokemon = pokemonStore[renderDataIndex]
  //const setPp = player == "One" ? setPpOne : setPpOne
  //setPp([pokemon.moves[0]?.pp_state,pokemon.moves[1]?.pp_state,pokemon.moves[2]?.pp_state,pokemon.moves[3]?.pp])
  /*const reducedMoves = []
  const movesPromise = new Promise(async resolve=>{
        for(let i = 0; i < renderData[pokemonIndex].moves.length; i++){
          const moveUrl = renderData[pokemonIndex].moves[i].move.url
          const apiMove =  await fetch(`https://pokeapi.co/${moveUrl}`).then(response=>response.json())
          reducedMoves.push(apiMove)
          if(i == renderData[pokemonIndex].moves.length -1){resolve(
            setPp([reducedMoves[0]?.pp,reducedMoves[1]?.pp,reducedMoves[2]?.pp,reducedMoves[3]?.pp]),
            setMoves(reducedMoves)  )}
        }
  })
  await movesPromise */
  /* const movesIndexes = renderData[pokemonIndex].moves.map(move => {return move.move.url.split("/")[6]})
  fetch(`${API_URL}pokemons/data/moves`,
  {method:'POST', headers:{'Content-Type':'application/json'},body:JSON.stringify({movesIndexes})})
  .then(response=>response.json()).then(data=>{
    setMoves(data)
    setPp([data[0]?.pp,data[1]?.pp,data[2]?.pp,data[3]?.pp])
    }) */
  	//const selectedPokemonIndex = renderPokeballs.findIndex(poke => poke?.index == pokemonIndex)
    const selectedPokemonIndex = renderPokeballs.findIndex(poke => poke?.index == pokemonIndex)
  	const emptySlotIndex = renderPokeballs.findIndex(p => p == null)
  	const handleRemovePokemon = () => {
  	if (selectedPokemonIndex !== -1) {
      setRenderPokeballsOne(prevRenderPokeballs => { // Use callback function for state update
        const newRenderPokeballs = [...prevRenderPokeballs]; // Create a copy
        newRenderPokeballs[selectedPokemonIndex] = null;
        return newRenderPokeballs;
      });
      localStorage.setItem(`pokeball${selectedPokemonIndex}`, null)
    }
  };
  	handleRemovePokemon()
	if(selectedPokemonIndex == -1 && emptySlotIndex != -1){
    setRenderPokeballsOne(prevRenderPokeballs => {   
      const newRenderPokeballs = [...prevRenderPokeballs]
      newRenderPokeballs[emptySlotIndex] = pokemon
      return newRenderPokeballs
    })
    localStorage.setItem(`pokeball${emptySlotIndex}`, renderDataIndex)
  }

}





	const renderSelectedPokemon = (player)=>{
  	const renderPokeballs = player == "One" ? renderPokeballsOne : renderPokeballsTwo
  	return <>
    {renderPokeballs.map((pokemon, index)=>(
    	<div key={index} className="pokemon-view">
    	<img src={pokemon =! null ? pokemon?.sprites.other?.showdown?.front_default : ""}></img>
    	</div>))}
  	</>
}

  
	
	return <>
  { <div className="pokemon-selection">
    <PokemonList pokemonToRender={pokemonStore} action={selectPokemon} page="Explore" pokeballs={renderPokeballsOne} ></PokemonList>

    <div className="ready-section"><div className="pokemon-one">
    {renderSelectedPokemon("One")}
    </div></div>

  	</div> 
  }

  	</>
})
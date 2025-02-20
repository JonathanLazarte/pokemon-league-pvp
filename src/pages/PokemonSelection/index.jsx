import './styles.css'
import BattleField from '../../pages/Battlefield/index.jsx'
import PokemonList from '../../components/pokemonList/pokemonList.jsx'
import PlayButton from '../../components/playButton/playButton.jsx'
import react, {useState, useEffect, useRef} from 'react'
import {io} from 'https://cdn.socket.io/4.8.0/socket.io.esm.min.js'
import { v4 as uuidv4 } from 'uuid';
import {useSelector} from 'react-redux'



export default function PokemonSelection({socket, roomId, setActualSection}){
    const {VITE_API_URL : API_URL} = import.meta.env;
	  const [renderData, setRenderData] = useState([])
  	const [renderPokeballsOne, setRenderPokeballsOne] = useState([null,null,null,null,null,null])
  	const [renderPokeballsTwo, setRenderPokeballsTwo] = useState([null,null,null,null,null,null])
	  const [pokemonOne, setPokemonOne] = useState()
  	const [pokemonTwo, setPokemonTwo] = useState()
  	const [currentPlayer, setCurrentPlayer] = useState(localStorage.getItem('currentPlayer') /*|| "One"*/)
  	const [isPlayerOneReady, setIsPlayerOneReady] = useState(false)
  	const [isPlayerTwoReady, setIsPlayerTwoReady] = useState(false)
    const [areBothReady, setAreBothReady] = useState(false)
  	const [types, setTypes] = useState([])
  	const token = localStorage.getItem('token')
    const userName = localStorage.getItem('userName')
    const {loading, pokemonStore, error} = useSelector(state => {return state.pokemonReducer})

    //const socket = s//io(`${API_URL}`,{ auth: {token}})
   

  	useEffect(() => {
 // dispatch(getPokemon(''))
  Promise.all([
    fetch(`${API_URL}pokemons/users/pokemon`,{method: 'POST', headers: {'Content-Type':'application/json'}, body:JSON.stringify({id : token})}),
    fetch(`${API_URL}pokemons/data/types`),
  ])
  .then(([response1, response2, response3]) => {
    Promise.all([response1.json(), response2.json()])
    .then(([data1, data2]) => {    
      setRenderData(data1);
      setTypes(data2.types);
    });
  });
}, []);


  const selectPokemon = (pokemonIndex, player)=>{
  const pokemonIndexInPokemonStore = pokemonStore.findIndex(p=> p.index == pokemonIndex)
  const pokemon = pokemonStore[pokemonIndexInPokemonStore]
  const renderPokeballs = player == "One" ? renderPokeballsOne : renderPokeballsTwo
  const setRenderPokeballs = player == "One" ? setRenderPokeballsOne : setRenderPokeballsTwo
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
  	const selectedPokemonIndex = renderPokeballs.findIndex(pokemon => pokemon?.index == pokemonIndex)
  	const emptySlotIndex = renderPokeballs.findIndex(p => p == null)
  	const handleRemovePokemon = () => {
  	if (selectedPokemonIndex !== -1) {
      setRenderPokeballs(prevRenderPokeballs => { // Use callback function for state update
        const newRenderPokeballs = [...prevRenderPokeballs]; // Create a copy
        newRenderPokeballs[selectedPokemonIndex] = null;
        return newRenderPokeballs;
      });
    }
  };
  	handleRemovePokemon()
	if(selectedPokemonIndex == -1&& emptySlotIndex != -1){
    setRenderPokeballs(prevRenderPokeballs => {
      const newRenderPokeballs = [...prevRenderPokeballs]
      newRenderPokeballs[emptySlotIndex] = pokemon
      return newRenderPokeballs
    })
  }

}


  	useEffect(() => {
    // Remove any existing listeners before adding a new one
    socket?.current?.off('selectpokemon');
    socket?.current?.on('selectpokemon', (msg) => {
      selectPokemon(msg.index, msg.currentPlayer)
      // Perform actions based on the message content here (e.g., update UI)
    });

    // Cleanup function to remove the listener when the component unmounts
    return () => socket?.current?.off('selectpokemon');
  }, [renderData, currentPlayer, renderPokeballsOne, renderPokeballsTwo]);

  const emitSelectPokemon = (index)=>{
    socket?.current?.emit('selectpokemon', {index, currentPlayer}) 
  }



useEffect(() => {
    // Remove any existing listeners before adding a new one
    socket?.current?.off('setpokemon');
    socket?.current?.on('setpokemon', (msg) => {
      const setPokemon = msg.currentPlayer == "One" ? setPokemonOne : setPokemonTwo
      const renderPokeballs = msg.currentPlayer == "One" ? renderPokeballsOne : renderPokeballsTwo 
      setPokemon(renderPokeballs[0])
      // Perform actions based on the message content here (e.g., update UI)
    });
    // Cleanup function to remove the listener when the component unmounts
    return () => socket?.current?.off('setpokemon');
  }, [renderPokeballsOne, renderPokeballsTwo, currentPlayer]);

  const emitSetPokemon = (index)=>{
    socket?.current?.emit('setpokemon', {index, currentPlayer}) 
  }



useEffect(()=>{
	if(isPlayerOneReady && isPlayerTwoReady){
		setAreBothReady(true)
	}
},[isPlayerOneReady, isPlayerTwoReady])


useEffect(()=>{
	socket?.current?.on("player-ready",(msg)=>{
		msg.currentPlayer == "One" ? setIsPlayerOneReady(true) : setIsPlayerTwoReady(true)
		msg.currentPlayer == "One" ? setRenderPokeballsOne(msg.renderPokeballs) : setRenderPokeballsTwo(msg.renderPokeballs) 
		console.log(msg)
	})
	return () => socket?.current?.off("player-ready")
	},[isPlayerOneReady, isPlayerTwoReady])

	const emitReadyPlayer = () =>{
	const renderPokeballs = currentPlayer == "One" ? renderPokeballsOne : renderPokeballsTwo
  socket?.current?.emit("player-ready", ({currentPlayer, renderPokeballs, roomId}))
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
  { !areBothReady && <div className="pokemon-selection">
    <PokemonList pokemonToRender={pokemonStore} pokeballs={currentPlayer == "One" ? renderPokeballsOne : renderPokeballsTwo} action={selectPokemon} page="Pvp" currentPlayer={currentPlayer}></PokemonList>
    <section className="ready-section">
    <div className="pokemon-one">
    {renderSelectedPokemon("One")}
    </div>
      <button className="ready-button" onClick={()=>{emitReadyPlayer()}}>{currentPlayer == "One" && isPlayerOneReady ? "Esperando al oponente" : currentPlayer == "Two" && isPlayerTwoReady ? "Esperando al oponente" : "LISTO"}</button>
    <div className="pokemon-one">
    {renderSelectedPokemon("Two")}
    </div> 
    </section>
    <PlayButton type="arenaPokemonSelection" text={currentPlayer == "One" && isPlayerOneReady ? "Esperando..." : currentPlayer == "Two" && isPlayerTwoReady ? "Esperando al oponente" : "LISTO"} okButtonAction={emitReadyPlayer}/>
  	</div> 
  }
	{ areBothReady && <BattleField roomId={roomId} socket={socket} PLAYER={currentPlayer} P1={renderPokeballsOne} P2={renderPokeballsTwo} TYPES={types} setActualSection={setActualSection}></BattleField>}

  	</>
}
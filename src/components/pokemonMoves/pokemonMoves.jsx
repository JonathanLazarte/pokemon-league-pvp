import './pokemonMoves.css'
import {useState} from 'react'
import {useDispatch} from 'react-redux'
import { updatePokemon } from '../../redux/slices/userPokemonSlice.js'
import { IoArrowBackOutline } from "react-icons/io5";


export default function MovesWindow({pokemon, moveToLearn, showWindow}){
	const [move, setMove] = useState(moveToLearn? moveToLearn : pokemon.moves[0])
	const {VITE_API_URL : API_URL} = import.meta.env;
	const token = localStorage.getItem("token");
	const dispatch = useDispatch()

	const flavorTextEntrie = () =>{
		const text = move.flavor_text_entrie //move.flavor_text_entries.find(text => text.language.name == "es")  
		return text.flavor_text
	}
	const renderTypes = (inputPokemon)=>{
    /*types && pokemon.types.map(t=>{     // HAY QUE PASAR POR PARAMS LOS TYPES PARA USAR ESTO
      let typeUrl = types?.find(type => type.name == t.type.name) // Usar el nombre del tipo dentro de los datos de un pokemon, buscar los datos completos del tipo dentro de el estado "Types"
      return <img src={typeUrl.sprites["generation-vii"]["sun-moon"]["name_icon"]}></img>
    })*/
    return inputPokemon.types.map(t=>{
      let id = t.type.url.split('/')[6]
      let url = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-iv/diamond-pearl/${id}.png`
      return <img src={url}></img>
    })
  	}
  	const renderMove = (move)=>{
			let id = move.type.url.split('/')[6]
   		let url = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-iv/diamond-pearl/${id}.png`
			return <div className="move-item" onMouseEnter={()=>setMove(move)} >
			<div className="sprite-name"><img src={url}></img>{move.name.toUpperCase()}</div>
			<div className="pp"><span>PP</span> {move.pp_state}/{move.pp_state}</div>
			</div>
		}
	const forgetMove = (moveToForget, pokemonIndex)=>{
		fetch(`${API_URL}pokemons/users/learnmove`,{method:'POST',headers:{'Content-Type': 'application/json'}, body:JSON.stringify({ userId: token, pokemonIndex, moveToForget, moveToLearn })})
		.then(response=>response.json()).then(data=>{
			alert(data.name.toUpperCase()+ " ha sido aprendida con exito")
			pokemon.moves[moveToForget] = moveToLearn
			dispatch(updatePokemon([pokemon]))
			showWindow(moveToForget)
		})
	}

	return <div className="moves-window">
		<h2>MOVIMIENTOS</h2>
			<div className="main-box">
						{move && <div className="move-details">
							<div className="poke-info">
								<img className="moves-pokemon-sprite" src={pokemon.sprites.versions["generation-viii"].icons.front_default}></img>
								<div className="types-sprites">{renderTypes(pokemon)}</div>
							</div>
							<div className="move-info">
								<h2>CATEGORIA: {move.damage_class.name.toUpperCase()}</h2>
								<h2>POTENCIA: {move.power ?? "??"}</h2>
								<h2>PRECISIÓN: {move.accuracy ?? "??"}</h2>
								<p>{flavorTextEntrie()}</p>
							</div>
						</div>}

										<div className="moves-container">
													<div className="moves-learned">
															{pokemon.moves.map((move, index)=>{
															const moveItemStyle = move.name == move.name ? {backgrounColor:"rgba(250, 250, 250, 0.02)"} : null
															let id = move.type.url.split('/')[6]
												   		let url = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-iv/diamond-pearl/${id}.png`
															return <div style={moveItemStyle} className="move-item" onMouseEnter={()=>setMove(move)} /*onMouseLeave={()=>setMove()}*/ onClick={moveToLearn ? ()=>forgetMove(index, pokemon.index) : null}>
															<div className="sprite-name"><img src={url}></img>{move.name.toUpperCase()}</div>
															<div className="pp"><span>PP</span> {move.pp_state}/{move.pp_state}</div>
															</div>})}
													</div>

													<div className="move-to-learn">
															{moveToLearn && renderMove(moveToLearn)}
													</div> 
										</div>
			</div>
			<button className="moves-comeback-button" onClick={()=>showWindow()}>{moveToLearn? "No aprender" : <IoArrowBackOutline />}</button>
	</div>	
}
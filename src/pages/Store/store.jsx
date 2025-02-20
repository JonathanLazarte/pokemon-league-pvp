import {useState} from 'react'
import PokemonShop from '../PokemonShop/pokemonShop.jsx'
import ItemsShop from '../ItemsShop/itemsShop.jsx'
import './store.css'



export default function Store({userItems}){
	const [actualSection, setActualSection] = useState("Pokemon")
	const buttonPokemon = actualSection == "Pokemon" ? {borderBottom:"2px solid #CDBE91 ", color:"#F0E6D2"} : null
    const buttonPokedex = actualSection == "Items" ? {borderBottom:"2px solid #CDBE91 ", color:"#F0E6D2"} : null


	return (
		<section className="store">
			<header className="store-header">
			<div style={buttonPokemon} className="subheader-item" onClick={()=>setActualSection("Pokemon")}>POKEMON</div>
			<div style={buttonPokedex} className="subheader-item" onClick={()=>setActualSection("Items")}>ITEMS</div></header>


			{actualSection == "Pokemon" && <PokemonShop/>}
			{actualSection == "Items" && <ItemsShop userItems={userItems}/>}
		</section>
	)
}




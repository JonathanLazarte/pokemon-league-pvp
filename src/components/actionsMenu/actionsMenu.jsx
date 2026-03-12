import { useState, useEffect, memo } from 'react'
import './actionsMenu.css'
import MoveButton from '../movesButtons/moveButton.jsx'
import { useSelector } from 'react-redux'
import { selectUserItemsData } from '../../redux/slices/userItemsSlice.js'
import { IoArrowBackOutline } from "react-icons/io5";





export default memo(function ActionsMenu({pokemon, setPlayerMove, moveRunning, effectEntrie, setPokemon, renderImage, /*items,*/ player, mode, setGameState}){
	const [selectedAction, setSelectedAction] = useState()
    const { userItems } = useSelector( selectUserItemsData );

    useEffect(()=>{
        if(pokemon.hp_state <= 0){ setSelectedAction("Pokemon") }
    },[pokemon])
	return <>
        <div className="actions-menu">
        {selectedAction && !pokemon.hp_state <= 0 ? <button className="comeback-button" onClick={()=>setSelectedAction()}> <IoArrowBackOutline />< /button> : null}
		{!moveRunning && !selectedAction ? <div className="actions-container">
              <button className="action-button" onClick={()=>setSelectedAction("Moves")}>ATACAR</button>
              <button className="action-button" onClick={()=>setSelectedAction("Pokemon")}>POKEMON</button> 
              <button className="action-button" onClick={()=>setSelectedAction("Items")}>ITEMS</button>   
              { mode == 'Explore' ? <button className="action-button" onClick={()=>{setSelectedAction("Huir"); setGameState("Two wins")}}>HUIR</button> : null} 
        </div> : null}
        {!moveRunning && selectedAction == "Moves" ? <div className="attack-container">
            {pokemon.moves.map((move, index) => <MoveButton key={move.id} move={move} emitAttack={setPlayerMove} pp={move.pp_state} index={index} setSelectedAction={setSelectedAction} player={player}></MoveButton>)}         
            </div> : null/*<div className="move-container">{effectEntrie}</div>*/}
        {!moveRunning && selectedAction == "Pokemon" ? <div className="pokemon-container">{renderImage?.map((pokeball,index)=>(
        	!pokeball.hp_state <= 0 && <button className="change-pokemon-button" onClick={()=>{if(pokemon.hp_state < 0 || pokemon.hp_state == 0){ setSelectedAction(); mode == "Explore" ? setPokemon(pokeball) : setPokemon({index, player}); } else { setSelectedAction(); setPlayerMove({index, player, type: "PokemonChange"})} }}><img src={pokeball.sprites.versions['generation-viii'].icons.front_default}></img>{pokeball.name.toUpperCase()}</button>))}</div> : null}
        {!moveRunning && selectedAction == "Items" ? <div className="items-container"><div className="items-list">{userItems?.map(item=><button className="item-button" onClick={()=> { setPlayerMove({index: item.id, type: "Item"}); setSelectedAction() }}>{item.amount}<img src={item.sprites.default}></img>{item.name.toUpperCase()}</button>)}</div></div> : null}
        {moveRunning && <div className="move-container"><span>{effectEntrie}</span></div>}
        </div>
        {/*pokemon.hp_state <= 0 && <h1>MI POKEMON ESTA DERROTADO</h1>*/}
        </>
})
import react from 'react'



export const MoveButton = ({move, emitAttack, pp, index, setSelectedAction, player})=>{ 
	const usingApi = move.type.url.split('/')[4].startsWith("v")
	return pp != 0 ? <button onClick={()=>{ emitAttack({move, index, player, type: "Attack"}); setSelectedAction() /*hay que usar esto en otro lado al terminar el turno*/ }} className={`attack1 btn ${move?.type?.name}`}>{move?.name?.toUpperCase()} <div><span>{pp == null ? move.pp : pp}</span>
	<img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-vi/x-y/${move.type.url.split('/')[usingApi ? 6 : 4]}.png`}></img></div>
	</button> : <button className={`attack1 btn ${move?.type?.name}`}>NO USEFUL</button>
}

export default MoveButton
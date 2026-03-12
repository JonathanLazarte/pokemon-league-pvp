import {memo} from 'react'
import './pokemonList.css'




export default memo(function PokemonList({pokemonToRender, action, actualPokemonSelected, page, currentPlayer, pokeballs}){
return (
    <div className="list-pokemon">
        {pokemonToRender && pokemonToRender.map((p, index) => {
            const style = p.index == actualPokemonSelected?.index || pokeballs?.some(pokeball => pokeball?.index == p?.index) 
                ? { background: "linear-gradient(to bottom, var(--gold-one), var(--gold-three))" } 
                : null;

            return (
                page != "Explore" && page != "Pvp" ? <div className="pokemon-item-border" style={style}><article 
                    className="pokemon-item" 
                    onClick={() => page == "Bag" ? action(index) : page == "Pvp" ? action(p.index, currentPlayer) : action(p.index)}
                    key={p.index} /* Asegúrate de agregar una clave única */
                >
                    <div className="box-1">
                        <img src={p.sprites.versions["generation-viii"].icons.front_default} alt={p.name} />
                        <div className="name-level">
                            <h5>{p.name.toUpperCase()}</h5>
                            <h5>Lv.{p.level}</h5>
                        </div>
                    </div>
                    <div className="hp-container">
                        <h3 className="health-count" translate="no">HP <span>{p.hp_state}</span></h3>
                        <progress className="bar-health" value={p.hp_state} max={p.stats[0].actual_stat}></progress>
                    </div>
                </article></div> : p.hp_state != 0 ? <div className="pokemon-item-border" style={style} ><article 
                    className="pokemon-item" 
                    onClick={() => page == "Bag" ? action(index) : page == "Pvp" ? action(p.index, currentPlayer) : action(p.index)}
                    key={p.index} /* Asegúrate de agregar una clave única */
                >
                    <div className="box-1">
                        <img src={p.sprites.versions["generation-viii"].icons.front_default} alt={p.name} />
                        <div className="name-level">
                            <h5>{p.name.toUpperCase()}</h5>
                            <h5>Lv.{p.level}</h5>
                        </div>
                    </div>
                    <div className="hp-container">
                        <h3 className="health-count" translate="no">HP <span>{p.hp_state}</span></h3>
                        <progress className="bar-health" value={p.hp_state} max={p.stats[0].actual_stat}></progress>
                    </div>
                </article></div> : null
            );
        })}
    </div>
);
	
})
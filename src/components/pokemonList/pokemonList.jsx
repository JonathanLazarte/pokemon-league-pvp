import {memo} from 'react'
import './pokemonList.css'




export default memo(function PokemonList({pokemonToRender, action, actualPokemonSelected, page, currentPlayer, pokeballs}){

return (
    <div className="list-pokemon">
        {pokemonToRender && pokemonToRender.map((p, index) => {
            const style = p.index == actualPokemonSelected?.index || pokeballs?.some(pokeball => pokeball?.index == p?.index) 
                ? { borderImage: "linear-gradient(to bottom, rgb(170, 10, 10), rgb(100, 10, 10)) 1", background: "linear-gradient(transparent, rgba(250, 250, 250, 0.1))" } 
                : null;

            return (
                <article 
                    style={style} 
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
                </article>
            );
        })}
    </div>
);
	
})
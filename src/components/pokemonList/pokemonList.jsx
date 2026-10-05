import { memo } from 'react';
import './pokemonList.css';

export default memo(function PokemonList({
  pokemonToRender,
  action,
  actualPokemonSelected,
  page,
  currentPlayer,
  pokeballs,
}) {
  return (
    <div className="list-pokemon">
      {pokemonToRender &&
        pokemonToRender.map((p, index) => {
          const isSelected =
            p.index === actualPokemonSelected?.index ||
            pokeballs?.some((pokeball) => pokeball?.index === p?.index);
          const style = isSelected
            ? { background: 'linear-gradient(to bottom, var(--gold-one), var(--gold-three))' }
            : null;

          const isBattlePage = page === 'Explore' || page === 'Pvp';
          if (isBattlePage && p.hp_state === 0) return null;

          const handleClick = () => {
            if (page === 'Bag') {
              action(index);
            } else if (page === 'Pvp') {
              action(p.index, currentPlayer);
            } else {
              action(p.index);
            }
          };

          return (
            <div key={p.index || index} className="pokemon-item-border" style={style}>
              <article className="pokemon-item" onClick={handleClick}>
                <div className="box-1">
                  <img
                    src={p.sprites?.versions?.['generation-viii']?.icons?.front_default}
                    alt={p.name}
                  />
                  <div className="name-level">
                    <h5>{p.name.toUpperCase()}</h5>
                    <h5>Lv.{p.level}</h5>
                  </div>
                </div>
                <div className="hp-container">
                  <h3 className="health-count" translate="no">
                    HP <span>{p.hp_state}</span>
                  </h3>
                  <progress
                    className="bar-health"
                    value={p.hp_state}
                    max={p.stats[0]?.actual_stat}
                  ></progress>
                </div>
              </article>
            </div>
          );
        })}
      {(!pokemonToRender || pokemonToRender.length === 0) && (
        <div style={{ fontFamily: 'Medium' }} className="no-pokemon">
          Aun no posees pokemones, consiguelos en la<br></br>tienda
        </div>
      )}
    </div>
  );
});
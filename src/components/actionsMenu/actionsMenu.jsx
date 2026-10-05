import { useState, useEffect, memo } from 'react';
import './actionsMenu.css';
import MoveButton from '../movesButtons/moveButton.jsx';
import { useSelector } from 'react-redux';
import { selectUserItemsData } from '../../redux/slices/userItemsSlice.js';
import { IoArrowBackOutline } from 'react-icons/io5';

export default memo(function ActionsMenu({
  pokemon,
  setPlayerMove,
  moveRunning,
  effectEntrie,
  setPokemon,
  ownPokeballs,
  player,
  mode,
  setGameState,
}) {
  const [selectedAction, setSelectedAction] = useState();
  const { userItems } = useSelector(selectUserItemsData);

  useEffect(() => {
    if (pokemon?.hp_state <= 0) {
      setSelectedAction('Pokemon');
    }
  }, [pokemon?.hp_state]);

  return (
    <div className="actions-menu">
      {selectedAction && pokemon?.hp_state > 0 ? (
        <button className="comeback-button" onClick={() => setSelectedAction(undefined)}>
          <IoArrowBackOutline />
        </button>
      ) : null}

      {!moveRunning && !selectedAction ? (
        <div className="actions-container">
          <button className="action-button" onClick={() => setSelectedAction('Moves')}>
            ATACAR
          </button>
          <button className="action-button" onClick={() => setSelectedAction('Pokemon')}>
            POKEMON
          </button>
          <button className="action-button" onClick={() => setSelectedAction('Items')}>
            ITEMS
          </button>
          {mode === 'Explore' ? (
            <button
              className="action-button"
              onClick={() => {
                setSelectedAction('Huir');
                setGameState('Two wins');
              }}
            >
              HUIR
            </button>
          ) : null}
        </div>
      ) : null}

      {!moveRunning && selectedAction === 'Moves' ? (
        <div className="attack-container">
          {pokemon?.moves?.map((move, index) => (
            <MoveButton
              key={move.id || index}
              move={move}
              emitAttack={setPlayerMove}
              pp={move.pp_state}
              index={index}
              setSelectedAction={setSelectedAction}
              player={player}
            />
          ))}
        </div>
      ) : null}

      {!moveRunning && selectedAction === 'Pokemon' ? (
        <div className="pokemon-container">
          {ownPokeballs?.map(
            (pokeball, index) =>
              pokeball.hp_state > 0 && pokeball.index !== pokemon.index && (
                <button
                  key={pokeball.index || index}
                  className="change-pokemon-button"
                  onClick={() => {
                    if (pokemon.hp_state <= 0) {
                      setSelectedAction(undefined);
                      if (mode === 'Explore') {
                        setPokemon(pokeball);
                      } else {
                        setPokemon({ index, player });
                      }
                    } else {
                      setSelectedAction(undefined);
                      setPlayerMove({ index, player, type: 'PokemonChange' });
                    }
                  }}
                >
                  <img
                    src={pokeball.sprites?.versions?.['generation-viii']?.icons?.front_default}
                    alt={pokeball.name}
                  />
                  {pokeball.name?.toUpperCase()}
                </button>
              )
          )}
        </div>
      ) : null}

      {!moveRunning && selectedAction === 'Items' ? (
        <div className="items-container">
          <div className="items-list">
            {userItems?.map((item) => (
              <button
                key={item.id}
                className="item-button"
                onClick={() => {
                  setPlayerMove({ index: item.id, type: 'Item' });
                  setSelectedAction(undefined);
                }}
              >
                {item.amount}
                <img src={item.sprites?.default} alt={item.name} />
                {item.name?.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {moveRunning && (
        <div className="move-container">
          <span>{effectEntrie}</span>
        </div>
      )}
    </div>
  );
});
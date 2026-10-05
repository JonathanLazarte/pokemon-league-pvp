import './pokemon.css';
import { useState, useEffect, memo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectUserPokemonData, updatePokemon, sellPokemon } from '../../redux/slices/userPokemonSlice.js';
import { selectUserItemsData } from '../../redux/slices/userItemsSlice.js';
import PokemonList from '../../components/pokemonList/pokemonList.jsx';
import MovesWindow from '../../components/pokemonMoves/pokemonMoves.jsx';
import { RiTempColdFill } from 'react-icons/ri';
import { LuSwords } from 'react-icons/lu';
import { PiHandCoins } from 'react-icons/pi';
import { IoArrowBackOutline } from 'react-icons/io5';
import { Riple } from 'react-loading-indicators';

export default memo(function Pokemon() {
  const dispatch = useDispatch();
  const [selectedAction, setSelectedAction] = useState();
  const [selectedPokemon, setSelectedPokemon] = useState(0);
  const { loading, userPokemon } = useSelector(selectUserPokemonData);
  const { userItems: items } = useSelector(selectUserItemsData);
  const [renderData, setRenderData] = useState(userPokemon[0]);

  useEffect(() => {
    userPokemon[selectedPokemon] ? setRenderData(userPokemon[selectedPokemon]) : setRenderData(undefined);
  }, [selectedPokemon, userPokemon]);

  const consumeItem = useCallback(
    ({ itemId, pokemonIndex }) => {
      let pokeballsState;
      switch (itemId) {
        case 23:
          pokeballsState = { index: pokemonIndex, hp: undefined };
          break;
        case 45:
          pokeballsState = { index: pokemonIndex, hp_effort: 50 };
          break;
        case 46:
          pokeballsState = { index: pokemonIndex, attack_effort: 50 };
          break;
        case 47:
          pokeballsState = { index: pokemonIndex, defense_effort: 50 };
          break;
        case 48:
          pokeballsState = { index: pokemonIndex, special_attack_effort: 50 };
          break;
        case 49:
          pokeballsState = { index: pokemonIndex, special_defense_effort: 50 };
          break;
        case 52:
          pokeballsState = { index: pokemonIndex, speed_effort: 50 };
          break;
        default:
          break;
      }
      if (pokeballsState) {
        dispatch(updatePokemon(pokeballsState));
      }
    },
    [dispatch]
  );

  return (
    <section className="pokemon-section">
      <div className="pokemon-list-container">
        <div className="list-tittle">Colección</div>
        {!loading ? (
          <PokemonList
            pokemonToRender={userPokemon}
            action={setSelectedPokemon}
            actualPokemonSelected={renderData}
            page="Bag"
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Riple color="var(--gold-one)" size="small" text="" textColor="" />
          </div>
        )}
      </div>

      <div className="pokemon-info">
        {selectedAction === 'Moves' && (
          <MovesWindow
            pokemon={renderData}
            moveToLearn={null}
            showWindow={setSelectedAction}
          />
        )}
        {renderData && (
          <>
            <div className="pokemon-details">
              <img
                className="pokemon-sprite"
                src={renderData?.sprites?.other?.showdown?.front_default}
                alt={renderData?.name}
              />
              <div className="pokemon-stats">
                <h2>{renderData?.name?.toUpperCase()}</h2>
                <div className="stat"><span>Level</span><span>{renderData?.level}</span></div>
                <br />
                <div className="stat"><span>HP</span><span>{renderData?.stats?.[0]?.actual_stat}</span></div>
                <div className="stat"><span>ATK</span><span>{renderData?.stats?.[1]?.actual_stat}</span></div>
                <div className="stat"><span>DEF</span><span>{renderData?.stats?.[2]?.actual_stat}</span></div>
                <div className="stat"><span>SP ATK</span><span>{renderData?.stats?.[3]?.actual_stat}</span></div>
                <div className="stat"><span>SP DEF</span><span>{renderData?.stats?.[4]?.actual_stat}</span></div>
                <div className="stat"><span>SPD</span><span>{renderData?.stats?.[5]?.actual_stat}</span></div>
              </div>
            </div>
            <div className="bottom-box">
              <div className="pokemon-actions">
                {selectedAction === 'ConsumeItems' && (
                  <div className="consume-items">
                    {Array.isArray(items) &&
                      items
                        .filter((item) =>
                          item.attributes?.some((atb) => atb.name === 'usable-overworld')
                        )
                        .map((item) => (
                          <button
                            className="item-button"
                            onClick={() =>
                              consumeItem({ itemId: item.id, pokemonIndex: renderData.index })
                            }
                            key={item.id}
                          >
                            <img src={item.sprites?.default} alt={item.name} />
                            {item.name?.toUpperCase()} x{item.amount}
                          </button>
                        ))}
                  </div>
                )}
                <div className="action-buttons">
                  {!selectedAction ? (
                    <>
                      <button
                        className="heal-button"
                        onClick={() => setSelectedAction('ConsumeItems')}
                        title="Usar Ítem"
                      >
                        <RiTempColdFill />
                      </button>
                      <button
                        className="heal-button"
                        onClick={() => setSelectedAction('Moves')}
                        title="Ver Movimientos"
                      >
                        <LuSwords />
                      </button>
                      <button
                        className="heal-button"
                        onClick={() => dispatch(sellPokemon({ pokemonId: renderData.index }))}
                        title="Vender Pokémon"
                      >
                        <PiHandCoins />
                      </button>
                    </>
                  ) : (
                    <button
                      className="heal-button"
                      onClick={() => setSelectedAction(undefined)}
                      title="Volver"
                    >
                      <IoArrowBackOutline />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
});
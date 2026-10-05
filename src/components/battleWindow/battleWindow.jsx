import ActionsMenu from '../actionsMenu/actionsMenu.jsx';
import MovesWindow from '../pokemonMoves/pokemonMoves.jsx';
import './battleWindow.css';
import { motion } from 'framer-motion';
import { memo } from 'react';
import { setActualSection, setUserState } from '../../redux/slices/userInterfaceSlice.js';
import { useDispatch } from 'react-redux';

export default memo(function BattleWindow({
  player,
  pokemonTwo,
  pokemonOne,
  gameState,
  setGameState,
  rounded1,
  rounded2,
  ownPokeballs,
  enemyPokeballs,
  setPokemon,
  setPlayerMove,
  moveRunning,
  effectEntrie,
  animationOne,
  animationTwo,
  battleMusic,
  damageDoneOne,
  mode,
  obtainedStats,
  moveToLearn,
  socket,
}) {
  const dispatch = useDispatch();

  const handleGameOverContinue = () => {
    if (battleMusic?.pause) {
      battleMusic.pause();
    }
    dispatch(setActualSection('ModeSelection'));
    dispatch(setUserState('Online'));
    localStorage.setItem('pokeball0', null);
    localStorage.setItem('pokeball1', null);
    localStorage.setItem('pokeball2', null);
    if (mode !== 'Explore') {
      socket?.current?.emit('leave-room');
    }
  };

  const renderGameOverWindow = () => {
    return gameState === `${player} wins` ? (
      <div className="game-over-window">
        <h1>VICTORIA</h1>
        <button onClick={handleGameOverContinue}>Continuar</button>
      </div>
    ) : (
      <div className="game-over-window">
        <h1>DERROTA</h1>
        <button onClick={handleGameOverContinue}>Aceptar</button>
      </div>
    );
  };

  const renderTypes = (pokemon) => {
    return pokemon?.types?.map((t) => {
      const id = t.type.url.split('/')[6];
      const url = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/sword-shield/${id}.png`;
      return <img key={id} src={url} alt={t.type.name} />;
    });
  };

  const renderLevelUpWindow = (pokemon) => {
    return (
      obtainedStats && (
        <div className="levelup-window">
          <div className="levelup-stat">
            <span>Lvl {obtainedStats[6]?.actual_stat} </span>
          </div>
          <br />
          <div className="levelup-stat">
            <span>HP </span>{' '}
            <span className="obtained-stat">
              + {obtainedStats[0]?.actual_stat - pokemon.stats[0]?.actual_stat}
            </span>
          </div>
          <div className="levelup-stat">
            <span>Attack </span>{' '}
            <span className="obtained-stat">
              + {obtainedStats[1]?.actual_stat - pokemon.stats[1]?.actual_stat}
            </span>
          </div>
          <div className="levelup-stat">
            <span>Defense </span>{' '}
            <span className="obtained-stat">
              + {obtainedStats[2]?.actual_stat - pokemon.stats[2]?.actual_stat}
            </span>
          </div>
          <div className="levelup-stat">
            <span>Special attack </span>{' '}
            <span className="obtained-stat">
              + {obtainedStats[3]?.actual_stat - pokemon.stats[3]?.actual_stat}
            </span>
          </div>
          <div className="levelup-stat">
            <span>Special defense </span>{' '}
            <span className="obtained-stat">
              + {obtainedStats[4]?.actual_stat - pokemon.stats[4]?.actual_stat}
            </span>
          </div>
          <div className="levelup-stat">
            <span>Speed </span>{' '}
            <span className="obtained-stat">
              + {obtainedStats[5]?.actual_stat - pokemon.stats[5]?.actual_stat}
            </span>
          </div>
        </div>
      )
    );
  };

  return (
    <>
      {pokemonTwo && pokemonOne ? (
        <div className="canvas">
          {gameState !== 'Active' && renderGameOverWindow()}
          {moveToLearn && (
            <MovesWindow
              pokemon={ownPokeballs?.[moveToLearn.pokemonIndexInPokeballs]}
              moveToLearn={moveToLearn.moveToLearn}
              showWindow={moveToLearn.resolve}
            />
          )}
          {renderLevelUpWindow(pokemonOne)}
          <div className="player-two-container">
            <div id="pokeballsP2">
              <div className="name-box-two">
                <h1>{pokemonTwo?.name?.toUpperCase()}</h1>
                <h2>
                  <div className="types-in-battle">{renderTypes(pokemonTwo)}</div> Lv.
                  {pokemonTwo.level}
                </h2>
              </div>
              <div className="hp-container-mew">
                <div className="health-count-p2">
                  HP <motion.span>{rounded2}</motion.span>/{pokemonTwo?.stats?.[0]?.actual_stat}
                </div>
                <progress
                  value={pokemonTwo?.hp_state}
                  max={pokemonTwo?.stats?.[0]?.actual_stat}
                  className="bar p2-health"
                ></progress>
              </div>
              <div className="pokeballs">
                {enemyPokeballs?.map((p, index) => {
                  const pokeballStyle = p?.hp_state <= 0 ? { filter: 'brightness(50%)' } : null;
                  return (
                    <img
                      style={pokeballStyle}
                      key={index}
                      src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/master-ball.png"
                      alt="Pokeball"
                    />
                  );
                })}
              </div>
            </div>
            <h1 className="damage-one">{animationTwo && ` ${damageDoneOne}`}</h1>
            <img
              className={animationTwo ? 'hited' : ''}
              id="ai-image"
              src={pokemonTwo?.sprites?.other?.showdown?.front_default}
              alt={pokemonTwo?.name}
            />
          </div>

          <div className="player-one-container">
            <div id="pokeballsP1">
              <div className="sprite-container">
                <img
                  className={animationOne ? 'hited' : ''}
                  src={pokemonOne?.sprites?.other?.showdown?.back_default}
                  id="charmander"
                  alt={pokemonOne?.name}
                />
              </div>
              <div className="player-one-data">
                <div className="name-box-one">
                  <h1>{pokemonOne?.name?.toUpperCase()}</h1>
                  <h2>
                    <div className="types-in-battle">{renderTypes(pokemonOne)}</div> Lv.
                    {pokemonOne.level}
                  </h2>
                </div>
                <div className="hp-container">
                  <div className="health-count-p1">
                    HP <motion.span>{rounded1}</motion.span>/{pokemonOne.stats?.[0]?.actual_stat}
                  </div>
                  <progress
                    value={pokemonOne.hp_state}
                    max={pokemonOne.stats?.[0]?.actual_stat}
                    className="bar p1-health"
                  ></progress>
                </div>
                <div className="pokeballs">
                  {ownPokeballs?.map((p, index) => {
                    const pokeballStyle = p?.hp_state <= 0 ? { filter: 'brightness(50%)' } : null;
                    return (
                      <img
                        style={pokeballStyle}
                        key={index}
                        src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/master-ball.png"
                        alt="Pokeball"
                      />
                    );
                  })}
                </div>
              </div>
            </div>

            {ownPokeballs && (
              <ActionsMenu
                pokemon={pokemonOne}
                setPokemon={setPokemon}
                ownPokeballs={ownPokeballs}
                setPlayerMove={setPlayerMove}
                moveRunning={moveRunning}
                effectEntrie={effectEntrie}
                player={player}
                mode={mode}
                setGameState={setGameState}
              />
            )}
          </div>
        </div>
      ) : null}
    </>
  );
});
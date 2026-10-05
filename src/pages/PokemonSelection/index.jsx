import './styles.css';
import BattleField from '../../pages/Battlefield/index.jsx';
import PokemonList from '../../components/pokemonList/pokemonList.jsx';
import PlayButton from '../../components/playButton/playButton.jsx';
import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { selectUserPokemonData } from '../../redux/slices/userPokemonSlice.js';
import { apiFetch } from '../../services/api.js';

export default function PokemonSelection({ socket, roomId }) {
  const [renderPokeballsOne, setRenderPokeballsOne] = useState([null, null, null, null, null, null]);
  const [renderPokeballsTwo, setRenderPokeballsTwo] = useState([null, null, null, null, null, null]);
  const [currentPlayer] = useState(localStorage.getItem('currentPlayer') || 'One');
  const [isPlayerOneReady, setIsPlayerOneReady] = useState(false);
  const [isPlayerTwoReady, setIsPlayerTwoReady] = useState(false);
  const [areBothReady, setAreBothReady] = useState(false);
  const [types, setTypes] = useState([]);
  const { userPokemon } = useSelector(selectUserPokemonData);

  useEffect(() => {
    apiFetch('pokemons/data/types')
      .then((res) => res.json())
      .then((data) => {
        setTypes(data.types || []);
      })
      .catch(() => {});
  }, []);

  const selectPokemon = useCallback((pokemonIndex, player) => {
    const pokemon = userPokemon.find((p) => p.index === pokemonIndex);
    if (!pokemon) return;

    const setRenderPokeballs = player === 'One' ? setRenderPokeballsOne : setRenderPokeballsTwo;

    setRenderPokeballs((prev) => {
      const selectedIndex = prev.findIndex((p) => p?.index === pokemonIndex);
      const emptySlotIndex = prev.findIndex((p) => p == null);

      if (selectedIndex !== -1) {
        const next = [...prev];
        next[selectedIndex] = null;
        return next;
      }
      if (emptySlotIndex !== -1) {
        const next = [...prev];
        next[emptySlotIndex] = pokemon;
        return next;
      }
      return prev;
    });
  }, [userPokemon]);

  useEffect(() => {
    const handleSelect = (msg) => {
      selectPokemon(msg.index, msg.currentPlayer);
    };

    socket?.current?.off('selectpokemon');
    socket?.current?.on('selectpokemon', handleSelect);

    return () => socket?.current?.off('selectpokemon', handleSelect);
  }, [socket, selectPokemon]);

  useEffect(() => {
    if (isPlayerOneReady && isPlayerTwoReady) {
      setAreBothReady(true);
    }
  }, [isPlayerOneReady, isPlayerTwoReady]);

  useEffect(() => {
    const handlePlayerReady = (msg) => {
      if (msg.currentPlayer === 'One') {
        setIsPlayerOneReady(true);
        setRenderPokeballsOne(msg.renderPokeballs);
      } else {
        setIsPlayerTwoReady(true);
        setRenderPokeballsTwo(msg.renderPokeballs);
      }
    };

    socket?.current?.off('player-ready');
    socket?.current?.on('player-ready', handlePlayerReady);

    return () => socket?.current?.off('player-ready', handlePlayerReady);
  }, [socket]);

  const emitReadyPlayer = () => {
    const renderPokeballs = currentPlayer === 'One' ? renderPokeballsOne : renderPokeballsTwo;
    socket?.current?.emit('player-ready', { currentPlayer, renderPokeballs, roomId });
  };

  const renderSelectedPokemon = (player) => {
    const pokeballs = player === 'One' ? renderPokeballsOne : renderPokeballsTwo;
    return (
      <>
        {pokeballs.map((pokemon, index) => (
          <div key={index} className="pokemon-view">
            <img
              src={pokemon ? pokemon?.sprites?.other?.showdown?.front_default : ''}
              alt=""
            />
          </div>
        ))}
      </>
    );
  };

  return (
    <>
      {!areBothReady && (
        <div className="pvp-pokemon-selection">
          <div className="pokemon-list-container">
            <PokemonList
              pokemonToRender={userPokemon}
              pokeballs={currentPlayer === 'One' ? renderPokeballsOne : renderPokeballsTwo}
              action={selectPokemon}
              page="Pvp"
              currentPlayer={currentPlayer}
            />
          </div>
          <section className="ready-section">
            <div className="pokemon-one">{renderSelectedPokemon('One')}</div>
            <div className="pokemon-one">{renderSelectedPokemon('Two')}</div>
          </section>
          <PlayButton
            type="arenaPokemonSelection"
            text={
              currentPlayer === 'One' && isPlayerOneReady
                ? 'Esperando...'
                : currentPlayer === 'Two' && isPlayerTwoReady
                ? 'Esperando al oponente'
                : 'LISTO'
            }
            okButtonAction={emitReadyPlayer}
          />
        </div>
      )}
      {areBothReady && (
        <BattleField
          roomId={roomId}
          socket={socket}
          PLAYER={currentPlayer}
          P1={renderPokeballsOne}
          P2={renderPokeballsTwo}
          TYPES={types}
        />
      )}
    </>
  );
}
import './pokemonMoves.css';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { updatePokemon } from '../../redux/slices/userPokemonSlice.js';
import { IoArrowBackOutline } from 'react-icons/io5';
import { apiFetch, getAuthToken } from '../../services/api.js';

export default function MovesWindow({ pokemon, moveToLearn, showWindow }) {
  const [move, setMove] = useState(moveToLearn || pokemon?.moves?.[0]);
  const token = getAuthToken();
  const dispatch = useDispatch();

  const flavorTextEntrie = () => {
    return move?.flavor_text_entrie?.flavor_text || '';
  };

  const renderTypes = (inputPokemon) => {
    return inputPokemon?.types?.map((t) => {
      const id = t.type.url.split('/')[6];
      const url = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-iv/diamond-pearl/${id}.png`;
      return <img key={id} src={url} alt={t.type.name} />;
    });
  };

  const renderMove = (moveToRender) => {
    const id = moveToRender.type.url.split('/')[6];
    const url = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-iv/diamond-pearl/${id}.png`;
    return (
      <div className="move-item" onMouseEnter={() => setMove(moveToRender)}>
        <div className="sprite-name">
          <img src={url} alt={moveToRender.name} />
          {moveToRender.name.toUpperCase()}
        </div>
        <div className="pp">
          <span>PP</span> {moveToRender.pp_state}/{moveToRender.pp_state}
        </div>
      </div>
    );
  };

  const forgetMove = async (moveToForget, pokemonIndex) => {
    try {
      const response = await apiFetch('pokemons/users/learnmove', {
        method: 'POST',
        body: JSON.stringify({
          userId: token,
          pokemonIndex,
          moveToForget,
          moveToLearn,
        }),
      });
      const data = await response.json();
      alert(`${data.name.toUpperCase()} ha sido aprendida con éxito`);
      if (pokemon?.moves) {
        pokemon.moves[moveToForget] = moveToLearn;
        dispatch(updatePokemon([pokemon]));
      }
      showWindow(moveToForget);
    } catch {
      // TODO: check original logic on move learn failure
    }
  };

  return (
    <div className="moves-window">
      <h2>MOVIMIENTOS</h2>
      <div className="main-box">
        {move && (
          <div className="move-details">
            <div className="poke-info">
              <img
                className="moves-pokemon-sprite"
                src={pokemon?.sprites?.versions?.['generation-viii']?.icons?.front_default}
                alt={pokemon?.name}
              />
              <div className="types-sprites">{renderTypes(pokemon)}</div>
            </div>
            <div className="move-info">
              <h2>CATEGORIA: {move.damage_class?.name?.toUpperCase()}</h2>
              <h2>POTENCIA: {move.power ?? '??'}</h2>
              <h2>PRECISIÓN: {move.accuracy ?? '??'}</h2>
              <p>{flavorTextEntrie()}</p>
            </div>
          </div>
        )}

        <div className="moves-container">
          <div className="moves-learned">
            {pokemon?.moves?.map((m, index) => {
              const id = m.type?.url?.split('/')?.[6];
              const url = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-iv/diamond-pearl/${id}.png`;
              return (
                <div
                  key={m.name || index}
                  className="move-item"
                  onMouseEnter={() => setMove(m)}
                  onClick={moveToLearn ? () => forgetMove(index, pokemon.index) : null}
                >
                  <div className="sprite-name">
                    <img src={url} alt={m.name} />
                    {m.name.toUpperCase()}
                  </div>
                  <div className="pp">
                    <span>PP</span> {m.pp_state}/{m.pp_state}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="move-to-learn">{moveToLearn && renderMove(moveToLearn)}</div>
        </div>
      </div>
      <button className="moves-comeback-button" onClick={() => showWindow()}>
        {moveToLearn ? 'No aprender' : <IoArrowBackOutline />}
      </button>
    </div>
  );
}
import './styles.css';
import PokemonList from '../../components/pokemonList/pokemonList.jsx';
import { useState, memo } from 'react';
import { useSelector } from 'react-redux';
import { selectUserPokemonData } from '../../redux/slices/userPokemonSlice.js';

export default memo(function ExplorePokemonSelection() {
  const [selectedPokeballs, setSelectedPokeballs] = useState([null, null, null]);
  const { userPokemon } = useSelector(selectUserPokemonData);

  const selectPokemon = (pokemonIndex) => {
    const renderDataIndex = userPokemon.findIndex((poke) => poke?.index === pokemonIndex);
    const pokemon = userPokemon[renderDataIndex];
    const selectedSlotIndex = selectedPokeballs.findIndex((poke) => poke?.index === pokemonIndex);
    const emptySlotIndex = selectedPokeballs.findIndex((p) => p == null);

    if (selectedSlotIndex !== -1) {
      setSelectedPokeballs((prev) => {
        const next = [...prev];
        next[selectedSlotIndex] = null;
        return next;
      });
      localStorage.setItem(`pokeball${selectedSlotIndex}`, null);
    } else if (emptySlotIndex !== -1) {
      setSelectedPokeballs((prev) => {
        const next = [...prev];
        next[emptySlotIndex] = pokemon;
        return next;
      });
      localStorage.setItem(`pokeball${emptySlotIndex}`, renderDataIndex);
    }
  };

  return (
    <div className="pokemon-selection">
      <div className="pokemon-list-container">
        <PokemonList
          pokemonToRender={userPokemon}
          action={selectPokemon}
          page="Explore"
          pokeballs={selectedPokeballs}
        />
      </div>
    </div>
  );
});
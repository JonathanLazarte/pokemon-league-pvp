import { useState, memo } from 'react';
import Pokedex from '../Pokedex/index.jsx';
import Pokemon from '../Pokemon/pokemon.jsx';
import './bag.css';

export default memo(function Bag() {
  const [actualSection, setActualSection] = useState('Pokemon');
  const buttonPokemon =
    actualSection === 'Pokemon'
      ? { borderBottom: '2px solid #CDBE91', color: '#F0E6D2' }
      : null;

  const playClickSound = () => {
    const menuClick = new Audio(
      'https://github.com/jonylazarte/resources/raw/refs/heads/main/general/menu-click.mp3'
    );
    menuClick.play().catch(() => {});
  };

  return (
    <section className="bag">
      <header className="bag-header">
        <div
          style={buttonPokemon}
          className="subheader-item"
          onClick={() => {
            playClickSound();
            setActualSection('Pokemon');
          }}
        >
          POKEMON
        </div>
      </header>

      {actualSection === 'Pokemon' && <Pokemon />}
      {actualSection === 'Pokedex' && <Pokedex />}
    </section>
  );
});
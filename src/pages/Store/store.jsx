import { useState, memo } from 'react';
import PokemonShop from '../PokemonShop/pokemonShop.jsx';
import ItemsShop from '../ItemsShop/itemsShop.jsx';
import './store.css';

export default memo(function Store() {
  const [actualSection, setActualSection] = useState('Pokemon');
  const buttonPokemon =
    actualSection === 'Pokemon'
      ? { borderBottom: '2px solid #CDBE91', color: '#F0E6D2' }
      : null;
  const buttonItems =
    actualSection === 'Items'
      ? { borderBottom: '2px solid #CDBE91', color: '#F0E6D2' }
      : null;

  return (
    <section className="store">
      <header className="store-header">
        <div
          style={buttonPokemon}
          className="subheader-item"
          onClick={() => setActualSection('Pokemon')}
        >
          POKEMON
        </div>
        <div
          style={buttonItems}
          className="subheader-item"
          onClick={() => setActualSection('Items')}
        >
          ITEMS
        </div>
      </header>

      {actualSection === 'Pokemon' && <PokemonShop />}
      {actualSection === 'Items' && <ItemsShop />}
    </section>
  );
});

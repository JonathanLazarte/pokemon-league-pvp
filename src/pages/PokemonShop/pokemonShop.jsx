import './pokemonShop.css';
import { useState, useEffect, memo, useRef, useCallback } from 'react';
import Card from '../../components/cards/pokeCard.jsx';
import { useSelector } from 'react-redux';
import { selectUserPokemonData } from '../../redux/slices/userPokemonSlice.js';
import { BsSearch } from 'react-icons/bs';
import { FaCheck } from 'react-icons/fa6';
import UseNearScreen from '../../services/UseNearScreen.js';
import ConfirmPurchaseWindow from '../../components/confirmPurchaseWindow/confirmPurchaseWindow.jsx';
import { apiFetch } from '../../services/api.js';

export default memo(function PokemonShop() {
  const [pokemon, setPokemon] = useState([]);
  const [renderData, setRenderData] = useState([]);
  const [searchKeys, setSearchKeys] = useState('');
  const { loading, userPokemon } = useSelector(selectUserPokemonData);
  const [types, setTypes] = useState();
  const [typeSelected, setTypeSelected] = useState('');
  const [generations, setGenerations] = useState();
  const [generationSelected, setGenerationSelected] = useState('');
  const [inCollection, setInCollection] = useState(false);
  const [sortedBy, setSortedBy] = useState('');
  const externalRef = useRef();
  const { isNearScreen } = UseNearScreen({ externalRef: loading ? null : externalRef, once: false });
  const [page, setPage] = useState(0);
  const { PurchaseWindow, activeWindow } = ConfirmPurchaseWindow('pokemon');

  const generationNames = [
    { name: 'Generation I', url: '/api/v2/generation/1/' },
    { name: 'Generation II', url: '/api/v2/generation/2/' },
    { name: 'Generation III', url: '/api/v2/generation/3/' },
    { name: 'Generation IV', url: '/api/v2/generation/4/' },
    { name: 'Generation V', url: '/api/v2/generation/5/' },
    { name: 'Generation VI', url: '/api/v2/generation/6/' },
    { name: 'Generation VII', url: '/api/v2/generation/7/' },
    { name: 'Generation VIII', url: '/api/v2/generation/8/' },
    { name: 'Generation IX', url: '/api/v2/generation/9/' },
  ];

  const typeNames = [
    { name: 'Normal' }, { name: 'Fighting' }, { name: 'Flying' }, { name: 'Poison' },
    { name: 'Ground' }, { name: 'Rock' }, { name: 'Bug' }, { name: 'Ghost' },
    { name: 'Steel' }, { name: 'Fire' }, { name: 'Water' }, { name: 'Grass' },
    { name: 'Electric' }, { name: 'Psychic' }, { name: 'Ice' }, { name: 'Dragon' },
    { name: 'Dark' }, { name: 'Fairy' },
  ];

  useEffect(() => {
    apiFetch('pokemons/')
      .then((res) => res.json())
      .then((data) => {
        setPokemon(data || []);
        setRenderData((data || []).slice(0, 25));
      })
      .catch(() => { });
  }, []);

  useEffect(() => {
    async function getTypes() {
      try {
        const res = await apiFetch('pokemons/data/types');
        const data = await res.json();
        setTypes(data.types);

        const gens = [];
        for (let i = 1; i < 10; i++) {
          const genRes = await fetch(`https://pokeapi.co/api/v2/generation/${i}`);
          const generation = await genRes.json();
          gens.push(generation);
        }
        setGenerations(gens);
      } catch {
        // TODO: check original logic on type/generation API error
      }
    }
    if (!types) getTypes();
  }, [types]);

  useEffect(() => {
    const typePokemonList = typeSelected ? types?.find((t) => t.name === typeSelected)?.pokemon || [] : [];
    const currentGen = generationSelected && generations ? generations[generationSelected] : null;

    const filtered = pokemon.filter((poke) => {
      const typeFilter = typeSelected ? typePokemonList.some((tp) => tp.pokemon.name === poke.name) : true;
      const genFilter = currentGen ? currentGen.pokemon_species?.some((p) => p.name === poke.name) : true;
      const keyFilter = searchKeys ? poke.name.toLowerCase().startsWith(searchKeys.toLowerCase()) : true;
      const collFilter = inCollection ? userPokemon.some((p) => p.name === poke.name) : true;

      return typeFilter && genFilter && keyFilter && collFilter;
    });

    if (sortedBy === 'alphabetically descend') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    }
    if (sortedBy === 'alphabetically ascend') {
      filtered.sort((a, b) => b.name.localeCompare(a.name));
    }

    if (typeSelected || searchKeys || generationSelected || inCollection || sortedBy) {
      setRenderData(filtered);
    } else {
      setRenderData(pokemon.slice(0, 100 + page * 50));
    }
  }, [typeSelected, searchKeys, generationSelected, inCollection, sortedBy, page, pokemon, types, generations, userPokemon]);

  useEffect(() => {
    setPage((prev) => prev + 1);
  }, [isNearScreen]);

  const handleCardClick = useCallback((poke) => {
    activeWindow(poke);
  }, [activeWindow]);

  return (
    <div className="pokemon-shop">
      <PurchaseWindow />
      <div className="filter-nav">
        <section className="nav-section first">
          <div className="search-filter">
            <BsSearch className="search-icon" />
            <input
              placeholder="Buscar"
              type="search"
              onKeyUp={(e) => setSearchKeys(e.currentTarget.value)}
            />
          </div>
          <div onClick={() => setInCollection((prev) => !prev)} className="checkbox">
            <div className="custom-checkbox">
              <FaCheck display={!inCollection ? 'none' : ''} className="check-icon" />
            </div>
            Mostrar en colección
          </div>
        </section>
        <section className="nav-section">
          <div className="select-container">
            <select className="select-filter" onChange={(e) => setSortedBy(e.currentTarget.value)}>
              <option value="">Precio ⭣</option>
              <option value="All">Precio ⭡</option>
              <option value="alphabetically descend">Alfabético ⭣</option>
              <option value="alphabetically ascend">Alfabético ⭡</option>
            </select>
          </div>

          <div className="select-container">
            <select className="select-filter" onChange={(e) => setTypeSelected(e.currentTarget.value)}>
              <option value="">Todos los tipos</option>
              {typeNames.map((type, idx) => (
                <option key={idx} value={type.name.toLowerCase()}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          <div className="select-container">
            <select className="select-filter" onChange={(e) => setGenerationSelected(e.currentTarget.value)}>
              <option value="">Todas las generaciones</option>
              {generationNames.map((gen, idx) => (
                <option key={idx} value={idx}>
                  {gen.name}
                </option>
              ))}
            </select>
          </div>
        </section>

        <section className="nav-section last">
          <div className="checkbox">
            <div className="custom-checkbox"></div>
            En oferta
          </div>
        </section>
      </div>

      <div className="grid-pokemon-container">
        <main className="pokemon-shop-grid">
          {renderData.map((poke, index) => (
            <Card
              key={poke.id || index}
              id={index}
              data={poke}
              section="store"
              onClick={() => handleCardClick(poke)}
            />
          ))}
          {renderData.length === 0 && !loading && (
            <div style={{ color: 'var(--gold-one)', gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
              No Pokémon found.
            </div>
          )}
          <button ref={externalRef} style={{ display: 'none' }}></button>
        </main>
      </div>
    </div>
  );
});
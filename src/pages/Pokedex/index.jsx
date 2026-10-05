import './styles.css';
import { useState, useEffect, memo, useRef } from 'react';
import Card from '../../components/cards/pokeCard.jsx';
import { useSelector } from 'react-redux';
import { selectUserPokemonData } from '../../redux/slices/userPokemonSlice.js';
import { BsSearch } from 'react-icons/bs';
import { FaCheck } from 'react-icons/fa6';
import UseNearScreen from '../../services/UseNearScreen.js';
import { apiFetch } from '../../services/api.js';

export default memo(function Pokedex() {
  const [pokemon, setPokemon] = useState([]);
  const [renderData, setRenderData] = useState([]);
  const [searchKeys, setSearchKeys] = useState('');
  const { loading, userPokemon } = useSelector(selectUserPokemonData);
  const [types, setTypes] = useState();
  const [typeSelected, setTypeSelected] = useState('');
  const [generations, setGenerations] = useState();
  const [generationSelected, setGenerationSelected] = useState('');
  const [inCollection, setInCollection] = useState(false);
  const [sortedBy, setSortedBy] = useState('All');
  const externalRef = useRef();
  const { isNearScreen } = UseNearScreen({ externalRef: loading ? null : externalRef, once: false });
  const [page, setPage] = useState(0);

  const typeNames = [
    { name: 'Normal' }, { name: 'Fighting' }, { name: 'Flying' }, { name: 'Poison' },
    { name: 'Ground' }, { name: 'Rock' }, { name: 'Bug' }, { name: 'Ghost' },
    { name: 'Steel' }, { name: 'Fire' }, { name: 'Water' }, { name: 'Grass' },
    { name: 'Electric' }, { name: 'Psychic' }, { name: 'Ice' }, { name: 'Dragon' },
    { name: 'Dark' }, { name: 'Fairy' },
  ];

  const generationNames = [
    { name: 'Generation I' }, { name: 'Generation II' }, { name: 'Generation III' },
    { name: 'Generation IV' }, { name: 'Generation V' }, { name: 'Generation VI' },
    { name: 'Generation VII' }, { name: 'Generation VIII' }, { name: 'Generation IX' },
  ];

  useEffect(() => {
    apiFetch('pokemons/')
      .then((res) => res.json())
      .then((data) => {
        setPokemon(data || []);
        setRenderData((data || []).slice(0, 25));
      })
      .catch(() => {});
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
          const gen = await genRes.json();
          gens.push(gen);
        }
        setGenerations(gens);
      } catch {
        // TODO: check original logic on type/generation fetch failure
      }
    }
    if (!types) getTypes();
  }, [types]);

  useEffect(() => {
    const typeObj = typeSelected ? types?.find((t) => t.name === typeSelected) : null;
    const currentGen = generationSelected && generations ? generations[generationSelected] : null;

    const filtered = pokemon.filter((poke) => {
      const typeFilter = typeSelected && typeObj ? typeObj.pokemon.some((p) => p.pokemon.name === poke.name) : true;
      const genFilter = currentGen ? currentGen.pokemon_species?.some((p) => p.name === poke.name) : true;
      const keyFilter = searchKeys ? poke.name.toLowerCase().startsWith(searchKeys.toLowerCase()) : true;
      const collFilter = inCollection ? userPokemon.some((p) => p.name === poke.name) : true;

      return typeFilter && keyFilter && genFilter && collFilter;
    });

    if (typeSelected || searchKeys || generationSelected || inCollection || sortedBy) {
      setRenderData(filtered);
    } else {
      setRenderData(pokemon.slice(0, 100 + page * 25));
    }
  }, [typeSelected, searchKeys, generationSelected, inCollection, sortedBy, page, pokemon, types, generations, userPokemon]);

  useEffect(() => {
    setPage((prev) => prev + 1);
  }, [isNearScreen]);

  return (
    <div className="pokedex-container">
      <div className="Pokedex">
        <div className="filter-nav">
          <div className="search-filter">
            <BsSearch className="search-icon" />
            <input
              placeholder="Buscar"
              type="search"
              onKeyUp={(e) => setSearchKeys(e.currentTarget.value)}
            />
          </div>

          <div className="checkbox" onClick={() => setInCollection((prev) => !prev)}>
            <div className="custom-checkbox" type="checkbox">
              <FaCheck display={!inCollection ? 'none' : ''} className="check-icon" />
            </div>
            Mostrar en colección
          </div>

          <div className="select-container">
            <select className="select-filter" onChange={(e) => setTypeSelected(e.currentTarget.value)}>
              <option value="">Todos los pokemon</option>
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

          <div className="select-container">
            <select className="select-filter" onChange={(e) => setSortedBy(e.currentTarget.value)}>
              <option value="All">Alfabético</option>
              <option value="User">Tasa de aparición</option>
            </select>
          </div>
        </div>

        <div className="grid-pokemon-container">
          <main>
            {renderData.map((poke, index) => (
              <Card key={poke.id || index} id={index} data={poke} />
            ))}
            {renderData.length === 0 && (
              <div style={{ color: 'var(--gold-one)', gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
                No Pokémon found.
              </div>
            )}
            <button ref={externalRef} style={{ display: 'none' }}></button>
          </main>
        </div>
      </div>
    </div>
  );
});
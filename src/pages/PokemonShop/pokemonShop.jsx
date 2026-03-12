import './pokemonShop.css'
import {react, useState, useEffect, memo, useRef} from 'react'
import Card from '../../components/cards/pokeCard.jsx'
import {useSelector, useDispatch} from 'react-redux'
import { selectUserPokemonData } from '../../redux/slices/userPokemonSlice.js';
import {useLocation} from 'wouter'
import { BsSearch } from "react-icons/bs"
import { FaCheck } from "react-icons/fa6";
import UseNearScreen from '../../services/UseNearScreen.js'
import ConfirmPurchaseWindow from '../../components/confirmPurchaseWindow/confirmPurchaseWindow.jsx'
import { updateCoins } from '../../redux/slices/userSlice.js'



export default memo(function PokemonShop(){
    const {VITE_API_URL : API_URL} = import.meta.env;
	//const toggleMenu = () => document.body.classList.toggle("open");
	const [pokemon, setPokemon] = useState([]);
	const [renderData, setRenderData] = useState([]) 
	const [searchKeys, setSearchKeys] = useState()
	const {loading, userPokemon, error} = useSelector(selectUserPokemonData);
    const [types, setTypes] = useState()
    const [typeSelected, setTypeSelected] = useState()
    const [generations, setGenerations] = useState()
    const [generationSelected, setGenerationSelected] = useState()
    const [inCollection, setInCollection] = useState(false)
    const [sortedBy, setSortedBy] = useState("")
    const [pokemonFrom, setPokemonFrom] = useState("All")
    const [path, setLocation] = useLocation();
    const token = localStorage.getItem('token')
    const externalRef = useRef()
    const {isNearScreen} = UseNearScreen({externalRef: loading ? null : externalRef, once: false})
    const [page, setPage] = useState(0)
    const {PurchaseWindow, activeWindow} = ConfirmPurchaseWindow("pokemon")
    const generationNames = [
        {
            "name": "Generation I",
            "url": "/api/v2/generation/1/"
        },
        {
            "name": "Generation II",
            "url": "/api/v2/generation/2/"
        },
        {
            "name": "Geneartion III",
            "url": "/api/v2/generation/3/"
        },
        {
            "name": "Generation IV",
            "url": "/api/v2/generation/4/"
        },
        {
            "name": "Generation V",
            "url": "/api/v2/generation/5/"
        },
        {
            "name": "Generation VI",
            "url": "/api/v2/generation/6/"
        },
        {
            "name": "Generation VII",
            "url": "/api/v2/generation/7/"
        },
        {
            "name": "Geneartion VIII",
            "url": "/api/v2/generation/8/"
        },
        {
            "name": "Generation IX",
            "url": "/api/v2/generation/9/"
        }
    ]
    const typeNames = [
        {
            "name": "Normal",
            "url": "/api/v2/type/1/"
        },
        {
            "name": "Fighting",
            "url": "/api/v2/type/2/"
        },
        {
            "name": "Flying",
            "url": "/api/v2/type/3/"
        },
        {
            "name": "Poison",
            "url": "/api/v2/type/4/"
        },
        {
            "name": "Ground",
            "url": "/api/v2/type/5/"
        },
        {
            "name": "Rock",
            "url": "/api/v2/type/6/"
        },
        {
            "name": "Bug",
            "url": "/api/v2/type/7/"
        },
        {
            "name": "Ghost",
            "url": "/api/v2/type/8/"
        },
        {
            "name": "Steel",
            "url": "/api/v2/type/9/"
        },
        {
            "name": "Fire",
            "url": "/api/v2/type/10/"
        },
        {
            "name": "Water",
            "url": "/api/v2/type/11/"
        },
        {
            "name": "Grass",
            "url": "/api/v2/type/12/"
        },
        {
            "name": "Electric",
            "url": "/api/v2/type/13/"
        },
        {
            "name": "Psychic",
            "url": "/api/v2/type/14/"
        },
        {
            "name": "Ice",
            "url": "/api/v2/type/15/"
        },
        {
            "name": "Dragon",
            "url": "/api/v2/type/16/"
        },
        {
            "name": "Dark",
            "url": "/api/v2/type/17/"
        },
        {
            "name": "Fairy",
            "url": "/api/v2/type/18/"
        },
        {
            "name": "Stellar",
            "url": "/api/v2/type/19/"
        },
        {
            "name": "Unknown",
            "url": "/api/v2/type/10001/"
        },
        {
            "name": "Shadow",
            "url": "/api/v2/type/10002/"
        }
    ]
    useEffect(()=>{
        pokemonFrom == "All" && fetch(`${API_URL}pokemons/`)
        .then(response => response.json())
        .then(data => {
            setPokemon(data); setRenderData(data.slice(0,25)); 
        });
    },[pokemonFrom])

    useEffect(()=>{
        async function getTypes(){
            fetch(`${API_URL}pokemons/data/types`)
            .then(response => response.json())
            .then(data => {
                setTypes(data.types)
        })
        var gens = []
                for(let i = 1; i < 10; i++){
                    const generation = await fetch(`https://pokeapi.co/api/v2/generation/${i}`).then(response=>response.json())
                    gens.push(generation)
                }
        setGenerations(gens)
        }
        !types && getTypes()
    },[]) 

    useEffect(()=>{
        const type = typeSelected ? types.find(type => type.name == typeSelected)?.pokemon : [];
        const type2 = types ? types.find(type => type.name == "fire")?.pokemon : [];
        //type.push(...type2)
        const gen = generationSelected && generations[generationSelected]   

        const pokemonFiltered = pokemon.filter(poke =>{
            const typeFilter = typeSelected ? type.some(pokemon => pokemon.pokemon.name == poke.name) /* && type2?.some(pokemon => pokemon.pokemon.name == poke.name) */ : true;
            const generationFilter = generationSelected ? gen['pokemon_species'].some(pokemon => pokemon.name == poke.name) : true;
            const keyFilter = searchKeys ? poke.name.startsWith(searchKeys.toLowerCase()) : true;
            const inCollectionFilter = inCollection ? userPokemon.some(pokemon => pokemon.name == poke.name) : true;

            return typeFilter && keyFilter && generationFilter && inCollectionFilter;
        })

        if(sortedBy == "alphabetically descend"){
            pokemonFiltered.sort((a, b) => {
            const nameA = a.name.toUpperCase();
            const nameB = b.name.toUpperCase();
            return nameA.localeCompare(nameB);
        }) }
        if(sortedBy == "alphabetically ascend"){
            pokemonFiltered.sort((a, b) => {
            const nameA = a.name.toUpperCase();
            const nameB = b.name.toUpperCase();
            return nameB.localeCompare(nameA);
        }) }

        if(typeSelected || searchKeys || generationSelected || inCollection || sortedBy){setRenderData(pokemonFiltered)} else {setRenderData(pokemon.slice(0, 100 + page * 50))}


    },[typeSelected, searchKeys, generationSelected, inCollection, sortedBy, page ])

    useEffect(()=>{
        setPage(prevPage=>prevPage+1)
    },[isNearScreen])
   
    const LoadPokemon = () => {
        return renderData?.map((poke, index) => (
            <Card
                key={poke.id || index} // Usar poke.id si está disponible, de lo contrario, index
                id={index}
                data={poke}
                section={"store"}
                onClick={()=>activeWindow(poke)}
            />
        ));
    };

    return (
            
            <div className="pokemon-shop">
                <PurchaseWindow />
                <div className="filter-nav">

                    <section className="nav-section first">

                        <div className="search-filter"><BsSearch className="search-icon" /><input placeholder="Buscar" type="search" onKeyUp={(event)=>setSearchKeys(event.currentTarget.value)}></input></div>    
                        <div onClick={()=>setInCollection(prevState => !inCollection)} className="checkbox" ><div className="custom-checkbox"><FaCheck display={!inCollection ? "none" : "" } className="check-icon"/></div>Mostrar en colección</div>

                    </section>
                    <section className="nav-section">
                    
                        <div className="select-container"><select className="select-filter" onChange={(event)=>{setSortedBy(event.currentTarget.value)}}>

                            <option value="">Precio ⭣ </option>
                            <option value="All">Precio ⭡ </option>
                            <option value="alphabetically descend">Alfabético ⭣ </option>
                            <option value="alphabetically ascend">Alfabético ⭡ </option>            
                            <option value ="User">Tasa de aparición ⭣</option>
                            <option value ="User">Tasa de aparición ⭡</option>

                        </select></div>
                    
                        <div className="select-container"><select className="select-filter" onChange={(event)=>{setTypeSelected(event.currentTarget.value)}}>
                        
                            <option value="">Todos los tipos</option>
                            {typeNames?.map((type, index) => <option key={index} value={type.name.toLowerCase()}>{type.name}</option>)}
                        
                        </select></div>

                        <div className="select-container"><select className="select-filter"  onChange={(event)=>{setGenerationSelected(event.currentTarget.value)}}>
                        
                            <option value="">Todas las generaciones</option>
                            {generationNames?.map((gen, index) => <option key={index} value={index}>{gen.name}</option>)}
                        
                        </select></div>

                    </section>

                    <section className="nav-section last">

                        <div className="checkbox" ><div className="custom-checkbox"></div>En oferta</div>

                    </section>

                </div>

                <div className="grid-pokemon-container"><main className="pokemon-shop-grid">{LoadPokemon()}<button ref={externalRef}></button></main></div>

            </div>

    )
	
})
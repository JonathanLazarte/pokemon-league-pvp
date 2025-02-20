import './pokemon.css'
import {useState, useEffect, memo} from 'react'
import {useSelector, useDispatch} from 'react-redux'
import {consumeItem, sellPokemon} from '../../store/actions/pokemonActions.js'
import PokemonList from '../../components/pokemonList/pokemonList.jsx'
import MovesWindow from '../../components/pokemonMoves/pokemonMoves.jsx'


export default memo(function Pokemon({}){
	const {VITE_API_URL : API_URL} = import.meta.env;
	const token = localStorage.getItem('token')
	const dispatch = useDispatch()
	//const [pokemon, setPokemon] = useState();
	const [selectedAction, setSelectedAction] = useState()
	const [selectedPokemon, setSelectedPokemon] = useState(0)
	const {loading, pokemonStore, items, error} = useSelector(state => {return state.pokemonReducer})
	const [renderData, setRenderData] = useState(pokemonStore[0]);

	useEffect(()=>{

		pokemonStore[selectedPokemon]? setRenderData(pokemonStore[selectedPokemon]) : setRenderData()

  	},[selectedPokemon, pokemonStore]) 



	return <section className="pokemon-section">
    {!loading && pokemonStore ? (
        <PokemonList
            pokemonToRender={pokemonStore}
            action={setSelectedPokemon}
            actualPokemonSelected={renderData}
            page="Bag"
        />
    ) : (
        <div>Cargando...</div>
    )}

    <div className="pokemon-info">
        {selectedAction == "Moves" && (
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
                        src={renderData?.sprites.other?.showdown?.front_default}
                        alt={renderData?.name}
                    />
                    <div className="pokemon-stats">
                        <h2>{renderData?.name.toUpperCase()}</h2>
                        <div className="stat"><span>Nivel</span><span>{renderData?.level}</span></div>
                        <br/>
                        <div className="stat"><span>HP</span><span>{renderData?.stats[0].actual_stat}</span></div>
                        <div className="stat"><span>Attack</span><span>{renderData?.stats[1].actual_stat}</span></div>
                        <div className="stat"><span>Defense</span><span>{renderData?.stats[2].actual_stat}</span></div>
                        <div className="stat"><span>Special Attack</span><span>{renderData?.stats[3].actual_stat}</span></div>
                        <div className="stat"><span>Special Defense</span><span>{renderData?.stats[4].actual_stat}</span></div>
                        <div className="stat"><span>Speed</span><span>{renderData?.stats[5].actual_stat}</span></div>
                    </div>
                </div>
                <div className="bottom-box">
                    <div className="pokemon-actions">
                        {selectedAction == "ConsumeItems" && (
                            <div className="consume-items">
                                {Array.isArray(items) &&
                                    items
                                        .filter((item) =>
                                            item.attributes.some(
                                                (atb) => atb.name == "usable-overworld"
                                            )
                                        )
                                        .map((item) => (
                                            <button
                                                className="item-button"
                                                onClick={() =>
                                                    dispatch(consumeItem(item.id, renderData.index))
                                                }
                                                key={item.id}
                                            >
                                                <img src={item.sprites.default} alt={item.name} />
                                                {item.name.toUpperCase()} x{item.amount}
                                            </button>
                                        ))}
                            </div>
                        )}
                        <div className="action-buttons">
                            {!selectedAction ? (
                                <>
                                    <button
                                        className="heal-button"
                                        onClick={() => setSelectedAction("ConsumeItems")}
                                    >
                                        CONSUMIBLES
                                    </button>
                                    <button
                                        className="heal-button"
                                        onClick={() => setSelectedAction("Moves")}
                                    >
                                        MOVIMIENTOS
                                    </button>
                                    <button
                                        className="heal-button"
                                        onClick={() => dispatch(sellPokemon(renderData.index))}
                                    >
                                        VENDER
                                    </button>
                                </>
                            ) : (
                                <button
                                    className="heal-button"
                                    onClick={() => setSelectedAction()}
                                >
                                    Back
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </>
        )}
    </div>
</section>

})
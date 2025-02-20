import {useState, useEffect, memo} from 'react'
import {useSelector, useDispatch} from 'react-redux'
import {addItem} from '../../store/actions/pokemonActions.js'
import { BsSearch } from "react-icons/bs"
import { GiDoubled, GiDividedSquare } from "react-icons/gi";
import { FaCheck } from "react-icons/fa6";
import './itemsShop.css'
import '../../components/confirmPurchaseWindow/confirmPurchaseWindow.css'
import { updateCoins } from '../../redux/slices/userSlice.js'

export const ConfirmPurchaseWindow = () => {
    const {VITE_API_URL : API_URL} = import.meta.env;
    const token = localStorage.getItem('token')
    const dispatch = useDispatch()
    const [showWindow, setShowWindow] = useState();
    const [productInfo, setProductInfo] = useState();
    const user = useSelector(state => state.user)

    const buyProduct = (price, coin) => {
        fetch(`${API_URL}pokemons/users/buyItem`,{
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ userId : token, itemId : productInfo.productID, price, coin })
        })
        .then(response => response.json())
        .then(data => {
            dispatch(addItem(data));
            dispatch(updateCoins({coin, price}))
            setShowWindow(false);
        });
    };
    const PurchaseWindow = () => {
        const productPrice = {rp: 350, be: 2000} 
        const newBalance = {rp: user.RP - productPrice.rp, be: user.BE - productPrice.be}
        const RPButtonStyle = user.RP - 350 >= 0 ? null : {filter: "grayscale(0.5)", cursor: "default"};
        const BEButtonStyle = user.BE - 2000 >= 0 ? null : {filter: "grayscale(0.5)", cursor: "default"};
        return (
            showWindow ? <div className="confirm-purchase-screen">
                <div style={{backgroundImage: `url('${productInfo.productImg}')`, backgroundRepeat: "no-repeat", backgroundSize: "contain", backgroundPositionY: "-90px", backgroundPositionX: "center"}}  className="confirm-purchase-window">
                    <div className="confirm-purchase-window-content">
                        <div className="exit-button"><button onClick={()=>setShowWindow(false)}>X</button></div> 
                        <div className="product-title">
                            <h2 className="product-name">{productInfo?.name?.toUpperCase()}</h2>
                            <span>¡Agrega este item a tu inventario!</span> 
                        </div>
                        <div className="product-buy-buttons">
                            <div onClick={()=>{user.RP - 350 >= 0 ? addToPokedex("RP", 350) : null}} style={RPButtonStyle} className="buy-rp-button">
                                <GiDividedSquare className="rp-icon" fontSize="25px" color="gold" />
                                {productPrice.rp}
                                {newBalance.rp >= 0 ? <span className="new-balance">nuevo saldo: {user.RP - 350}</span> : <span className="new-balance" style={{color: "red"}}>Saldo insuficiente</span>}
                            </div>
                            <div onClick={()=>{user.BE - 2000 >= 0 ? addToPokedex("BE", 2000) : null}} style={BEButtonStyle} className="buy-be-button">
                                <GiDoubled className="be-icon" fontSize="25px" color="0ACBE6" />
                                {productPrice.be}
                                {newBalance.be >= 0 ? <span className="new-balance">nuevo saldo: {user.BE - 2000}</span> : <span className="new-balance" style={{color: "red"}}>Saldo insuficiente</span>}
                            </div>
                        </div> 
                    </div>       
                </div>
            </div> : null
        )
    }
    const activeWindow = (product) => {
        const productID = (product.url?.split("/")[6])
        const productImg = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${product.name}.png`
        setShowWindow(true)
        setProductInfo({...product, productImg, productID})
    }
    return ({PurchaseWindow, activeWindow})
}






export default memo(function ItemsShop({userItems}){
	const {VITE_API_URL : API_URL} = import.meta.env
	const [items, setItems] = useState([])
	const [renderData, setRenderData] = useState([])
	const token = localStorage.getItem('token')
	const [searchKeys, setSearchKeys] = useState()
	//const dispatch = useDispatch()
	//const {loading, pokemonStore, error} = useSelector(state => {return state.pokemonReducer})
    const [types, setTypes] = useState()
    const [typeSelected, setTypeSelected] = useState()
    const [pokemonFrom, setPokemonFrom] = useState("All")
    const [inCollection, setInCollection] = useState(false)
    const [sortedBy, setSortedBy] = useState()
    const {PurchaseWindow, activeWindow} = ConfirmPurchaseWindow()

	useEffect(()=>{
		/*for(let i=0; i<100; i++){
			const item = fetch(`https://pokeapi.co/api/v2/item?offset=20&limit=200`).then(response=>)
		}*/
		fetch(`https://pokeapi.co/api/v2/item?offset=0&limit=304`).then(response=>response.json()).then(data=>{ setItems(data.results); setRenderData(data.results) })
	},[])

	const buyItem = (itemId)=>{
		fetch(`${API_URL}pokemons/users/buyItem`,{
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ userId : token, itemId : itemId })
        })
        .then(response => response.json())
        .then(data => {
            dispatch(addItem(data))
        });
	}

	useEffect(()=>{ 
        const itemsFiltered = items.filter(item =>{
        const keyFilter = searchKeys ? item.name.startsWith(searchKeys.toLowerCase()) : true;
        const inCollectionFilter = inCollection ? userItems.some(i => i.name == item.name) : true;
        return keyFilter && inCollectionFilter;
        })

        if(sortedBy == "alphabetically descend"){
            itemsFiltered.sort((a, b) => {
            const nameA = a.name.toUpperCase();
            const nameB = b.name.toUpperCase();
            return nameA.localeCompare(nameB);
        }) }
        if(sortedBy == "alphabetically ascend"){
            itemsFiltered.sort((a, b) => {
            const nameA = a.name.toUpperCase();
            const nameB = b.name.toUpperCase();
            return nameB.localeCompare(nameA);
        }) }

        if( searchKeys || inCollection || itemsFiltered ){ setRenderData(itemsFiltered) } else { setRenderData(items) }

    },[searchKeys, inCollection, sortedBy])



	return (
		<div className="items-section">
                <PurchaseWindow/>
				<div className="filter-nav">

                    <section className="nav-section first">
                        <div className="search-filter"><BsSearch className="search-icon"/><input placeholder="Buscar" type="search" onKeyUp={(event)=>setSearchKeys(event.currentTarget.value)}></input></div>
                    
                        <div onClick={()=>setInCollection(prevState => !inCollection)} className="checkbox" ><div className="custom-checkbox"><FaCheck display={!inCollection ? "none" : "" } className="check-icon"/></div>Mostrar en colección</div>
          
                    </section>
                    <section className="nav-section">
                        <select className="select-filter" onChange={(event)=>{setSortedBy(event.currentTarget.value)}}>

                            <option value="">Precio ⭣ </option>
                            <option value="price ascend">Precio ⭡ </option>
                            <option value="alphabetically descend">Alfabético ⭣ </option>
                            <option value="alphabetically ascend">Alfabético ⭡ </option>           

                        </select>
           
                       	<div className="checkbox"><div className="custom-checkbox" ></div>Pokeballs</div>
                       	<div className="checkbox"><div className="custom-checkbox" ></div>Pociones</div>
                       	<div className="checkbox"><div className="custom-checkbox" ></div>Nutrientes</div>

                    </section>
                    <section className="nav-section last">
           
                        <div className="checkbox"><div className="custom-checkbox" ></div>En oferta</div>

                    </section>
                </div>
				<div className="items-grid-container">
                    <div className="items">
					   {renderData?.map(item=>(
						    <article onClick={()=>activeWindow(item)}>
						        <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${item.name}.png`}></img>
						        <div className="product-info">
						            <h3>{item.name.toUpperCase()}</h3>
							        <div className="price">
								        <div className="essences-price"><GiDoubled  fontSize="1.2em" color="0ACBE6" />2000</div> 
								        <div className="rp-price"><GiDividedSquare  fontSize="1.2em" color="gold" /> 350</div>
							        </div>
						        </div>
						    </article>)
                        )}
				    </div>
                </div>
			</div>)
})
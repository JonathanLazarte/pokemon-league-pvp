import {useSelector, useDispatch} from 'react-redux'
import {useState} from 'react'
import { GiDoubled, GiDividedSquare } from "react-icons/gi";
import { updateCoins } from '../../redux/slices/userSlice.js';
import { buyItem } from '../../redux/slices/userItemsSlice.js';
import { addPokemon } from '../../redux/slices/userPokemonSlice.js';
import './confirmPurchaseWindow.css'



export default function ConfirmPurchaseWindow(section){
    const {VITE_API_URL : API_URL} = import.meta.env;
    const token = localStorage.getItem('token')
    const dispatch = useDispatch()
    const [showWindow, setShowWindow] = useState();
    const [productInfo, setProductInfo] = useState();
    const user = useSelector(state => state.user)

    const buyProduct = async (coin, price) => {
    	const body = section == "pokemon" ? {
    		userID : token,
            pokemonID : productInfo.productID,
            pokemonName : ""/*window.prompt("Nombra a tu pokemon")*/,
            coin,
            price
    	} : {
    		userId : token,
            itemId : productInfo.productID,
            price,
            coin
    	};
        if(section != "pokemon"){
            await dispatch(buyItem(body));
            await dispatch(updateCoins({coin, price}));
            await setShowWindow(false);
        } else {
            await dispatch(addPokemon({pokemonId: productInfo.productID, coin, price}));
            await dispatch(updateCoins({coin, price}));
            await setShowWindow(false);
        }
    };
    /*const buyProduct = (price, coin) => {
        fetch(`${API_URL}pokemons/users/buyItem`,{
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ userId : token, itemId : productInfo.productID, price, coin })
        })
        .then(response => response.json())
        .then(data => {
            dispatch( addItem(data) );
            dispatch(updateCoins({coin, price}))
            setShowWindow(false);
        });
    };*/

    const PurchaseWindow = () => {
        const productPrice = {rp: 350, be: 2000} 
        const newBalance = {rp: user.RP - productPrice.rp, be: user.BE - productPrice.be}
        const RPButtonStyle = user.RP - 350 >= 0 ? null : {filter: "grayscale(0.5)", cursor: "default"};
        const BEButtonStyle = user.BE - 2000 >= 0 ? null : {filter: "grayscale(0.5)", cursor: "default"};
        return (
            showWindow ? <div className="confirm-purchase-screen">
                <div style={{backgroundImage: `url('${productInfo.productImg}')`}}  className="confirm-purchase-window">
                    <div className="confirm-purchase-window-content">
                        <div className="exit-button"><button onClick={()=>setShowWindow(false)}>X</button></div> 
                        <div className="product-title">
                            <h2 className="product-name">{productInfo?.name?.toUpperCase()}</h2>
                            <span>¡Agrega este pokemon a tu alineación!</span> 
                        </div>
                        <div className="product-buy-buttons">
                            <div onClick={()=>{user.RP - 350 >= 0 ? buyProduct("RP", 350) : null}} style={RPButtonStyle} className="buy-rp-button">
                                <GiDividedSquare className="rp-icon" fontSize="25px" color="gold" />
                                {productPrice.rp}
                                {newBalance.rp >= 0 ? <span className="new-balance">Nuevo saldo: {user.RP - 350}</span> : <span className="new-balance" style={{color: "red"}}>Saldo insuficiente</span>}
                            </div>
                            <div onClick={()=>{user.BE - 2000 >= 0 ? buyProduct("BE", 2000) : null}} style={BEButtonStyle} className="buy-be-button">
                                <GiDoubled className="be-icon" fontSize="25px" color="0ACBE6" />
                                {productPrice.be}
                                {newBalance.be >= 0 ? <span className="new-balance">Nuevo saldo: {user.BE - 2000}</span> : <span className="new-balance" style={{color: "red"}}>Saldo insuficiente</span>}
                            </div>
                        </div> 
                    </div>       
                </div>
            </div> : null
        )
    }
    const activeWindow = (product) => {
        const productID = section == "pokemon" ? (product.url?.split("/")[4]) : (product.url?.split("/")[6]);
        const productImg = section == "pokemon" ? `./assets/images/pokemon/${productID}.png` : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${product.name}.png`
        setShowWindow(true)
        setProductInfo({...product, productImg, productID})
    }

    return ({PurchaseWindow, activeWindow})
}
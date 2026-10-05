import { useSelector, useDispatch } from 'react-redux';
import { useState, useCallback } from 'react';
import { GiDoubled, GiDividedSquare } from 'react-icons/gi';
import { updateCoins } from '../../redux/slices/userSlice.js';
import { buyItem } from '../../redux/slices/userItemsSlice.js';
import { addPokemon } from '../../redux/slices/userPokemonSlice.js';
import { getAuthToken } from '../../services/api.js';
import './confirmPurchaseWindow.css';

export default function ConfirmPurchaseWindow(section) {
  const token = getAuthToken();
  const dispatch = useDispatch();
  const [showWindow, setShowWindow] = useState(false);
  const [productInfo, setProductInfo] = useState();
  const user = useSelector((state) => state.user);

  const buyProduct = async (coin, price) => {
    const body =
      section === 'pokemon'
        ? {
            userID: token,
            pokemonID: productInfo.productID,
            pokemonName: '',
            coin,
            price,
          }
        : {
            userId: token,
            itemId: productInfo.productID,
            price,
            coin,
          };

    if (section !== 'pokemon') {
      await dispatch(buyItem(body));
      dispatch(updateCoins({ coin, price }));
      setShowWindow(false);
    } else {
      await dispatch(addPokemon({ pokemonId: productInfo.productID, coin, price }));
      dispatch(updateCoins({ coin, price }));
      setShowWindow(false);
    }
  };

  const PurchaseWindow = () => {
    const productPrice = { rp: 350, be: 2000 };
    const newBalance = { rp: user.RP - productPrice.rp, be: user.BE - productPrice.be };
    const RPButtonStyle = user.RP - 350 >= 0 ? null : { filter: 'grayscale(0.5)', cursor: 'default' };
    const BEButtonStyle = user.BE - 2000 >= 0 ? null : { filter: 'grayscale(0.5)', cursor: 'default' };

    return showWindow ? (
      <div className="confirm-purchase-screen">
        <div
          style={{ backgroundImage: `url('${productInfo.productImg}')` }}
          className="confirm-purchase-window"
        >
          <div className="confirm-purchase-window-content">
            <div className="exit-button">
              <button onClick={() => setShowWindow(false)}>X</button>
            </div>
            <div className="product-title">
              <h2 className="product-name">{productInfo?.name?.toUpperCase()}</h2>
              <span>
                {section === 'pokemon'
                  ? '¡Agrega este pokemon a tu alineación!'
                  : '¡Agrega este item a tu inventario!'}
              </span>
            </div>
            <div className="product-buy-buttons">
              <div
                onClick={() => {
                  user.RP - 350 >= 0 ? buyProduct('RP', 350) : null;
                }}
                style={RPButtonStyle}
                className="buy-rp-button"
              >
                <GiDividedSquare className="rp-icon" fontSize="25px" color="gold" />
                {productPrice.rp}
                {newBalance.rp >= 0 ? (
                  <span className="new-balance">Nuevo saldo: {user.RP - 350}</span>
                ) : (
                  <span className="new-balance" style={{ color: 'red' }}>
                    Saldo insuficiente
                  </span>
                )}
              </div>
              <div
                onClick={() => {
                  user.BE - 2000 >= 0 ? buyProduct('BE', 2000) : null;
                }}
                style={BEButtonStyle}
                className="buy-be-button"
              >
                <GiDoubled className="be-icon" fontSize="25px" color="0ACBE6" />
                {productPrice.be}
                {newBalance.be >= 0 ? (
                  <span className="new-balance">Nuevo saldo: {user.BE - 2000}</span>
                ) : (
                  <span className="new-balance" style={{ color: 'red' }}>
                    Saldo insuficiente
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    ) : null;
  };

  const activeWindow = useCallback((product) => {
    const productID =
      section === 'pokemon'
        ? product.url?.split('/')[4]
        : product.url?.split('/')[6];
    const productImg =
      section === 'pokemon'
        ? `./assets/images/pokemon/${productID}.png`
        : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${product.name}.png`;
    setShowWindow(true);
    setProductInfo({ ...product, productImg, productID });
  }, [section]);

  return { PurchaseWindow, activeWindow };
}
import { useState, useEffect, memo } from 'react';
import { useSelector } from 'react-redux';
import { BsSearch } from 'react-icons/bs';
import { GiDoubled, GiDividedSquare } from 'react-icons/gi';
import { FaCheck } from 'react-icons/fa6';
import './itemsShop.css';
import ConfirmPurchaseWindow from '../../components/confirmPurchaseWindow/confirmPurchaseWindow.jsx';
import { selectUserItemsData } from '../../redux/slices/userItemsSlice.js';

export default memo(function ItemsShop() {
  const [items, setItems] = useState([]);
  const [renderData, setRenderData] = useState([]);
  const [searchKeys, setSearchKeys] = useState('');
  const [inCollection, setInCollection] = useState(false);
  const [sortedBy, setSortedBy] = useState('');
  const { PurchaseWindow, activeWindow } = ConfirmPurchaseWindow('item');
  const { userItems } = useSelector(selectUserItemsData);

  useEffect(() => {
    fetch('https://pokeapi.co/api/v2/item?offset=0&limit=304')
      .then((response) => response.json())
      .then((data) => {
        setItems(data.results || []);
        setRenderData(data.results || []);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const itemsFiltered = items.filter((item) => {
      const keyFilter = searchKeys ? item.name.toLowerCase().startsWith(searchKeys.toLowerCase()) : true;
      const inCollectionFilter = inCollection ? userItems.some((i) => i.name === item.name) : true;
      return keyFilter && inCollectionFilter;
    });

    if (sortedBy === 'alphabetically descend') {
      itemsFiltered.sort((a, b) => a.name.localeCompare(b.name));
    }
    if (sortedBy === 'alphabetically ascend') {
      itemsFiltered.sort((a, b) => b.name.localeCompare(a.name));
    }

    setRenderData(itemsFiltered);
  }, [searchKeys, inCollection, sortedBy, items, userItems]);

  return (
    <div className="items-section">
      <PurchaseWindow />
      <div className="filter-nav">
        <section className="nav-section first">
          <div className="search-filter">
            <BsSearch className="search-icon" />
            <input
              placeholder="Buscar"
              type="search"
              onKeyUp={(event) => setSearchKeys(event.currentTarget.value)}
            />
          </div>

          <div onClick={() => setInCollection((prevState) => !prevState)} className="checkbox">
            <div className="custom-checkbox">
              <FaCheck display={!inCollection ? 'none' : ''} className="check-icon" />
            </div>
            Mostrar en colección
          </div>
        </section>
        <section className="nav-section">
          <div className="select-container">
            <select className="select-filter" onChange={(event) => setSortedBy(event.currentTarget.value)}>
              <option value="">Precio ⭣</option>
              <option value="price ascend">Precio ⭡</option>
              <option value="alphabetically descend">Alfabético ⭣</option>
              <option value="alphabetically ascend">Alfabético ⭡</option>
            </select>
          </div>

          <div className="checkbox">
            <div className="custom-checkbox"></div>Pokeballs
          </div>
          <div className="checkbox">
            <div className="custom-checkbox"></div>Pociones
          </div>
          <div className="checkbox">
            <div className="custom-checkbox"></div>Nutrientes
          </div>
        </section>
        <section className="nav-section last">
          <div className="checkbox">
            <div className="custom-checkbox"></div>En oferta
          </div>
        </section>
      </div>
      <div className="items-grid-container">
        <div className="items">
          {renderData.map((item, index) => (
            <article key={item.name || index} onClick={() => activeWindow(item)}>
              <img
                src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${item.name}.png`}
                alt={item.name}
              />
              <div className="product-info">
                <h3>{item.name.toUpperCase()}</h3>
                <div className="price">
                  <div className="essences-price">
                    <GiDoubled fontSize="1.2em" color="0ACBE6" />
                    <span className="price-number">2000</span>
                  </div>
                  <div className="rp-price">
                    <GiDividedSquare fontSize="1.2em" color="gold" />
                    <span className="price-number">350</span>
                  </div>
                </div>
              </div>
            </article>
          ))}
          {renderData.length === 0 && (
            <div style={{ color: 'var(--gold-one)', gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
              No items found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
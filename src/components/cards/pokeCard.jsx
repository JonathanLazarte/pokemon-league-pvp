import { memo } from 'react';
import { GiDoubled, GiDividedSquare } from 'react-icons/gi';
import './pokeCard.css';

const PokeCard = ({ id, data, section, onClick }) => {
  const pokemonIndex = data?.url?.split('/')[4];

  return (
    <article
      id={id}
      className="pokemon-card"
      onClick={() => {
        if (section === 'store' && onClick) onClick();
      }}
    >
      <img
        className="pokemon"
        id={id}
        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonIndex}.png`}
        alt={`Sprite of ${data.name}`}
      />
      {section === 'store' ? (
        <div className="product-info">
          <h2 className="title">{data.name.toUpperCase()}</h2>
          <div className="price">
            <div className="essences-price">
              <GiDoubled fontSize="1.1em" color="0ACBE6" />
              <span className="price-number">2000</span>
            </div>
            <div className="rp-price">
              <GiDividedSquare fontSize="1.1em" color="gold" />
              <span className="price-number">350</span>
            </div>
          </div>
        </div>
      ) : (
        <h2 className="title">{data.name.toUpperCase()}</h2>
      )}
    </article>
  );
};

export default memo(PokeCard);
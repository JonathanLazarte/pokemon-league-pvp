import {react, memo} from 'react'
import { GiDoubled, GiDividedSquare } from "react-icons/gi";
import './pokeCard.css'


const pokeCard = ({ id, data, section, onClick })=>{
        const pokemonIndex = (data.url?.split("/")[4])
        const typesArray = [
        {
            "name": "normal",
            "url": "/api/v2/type/1/"
        },
        {
            "name": "fighting",
            "url": "/api/v2/type/2/"
        },
        {
            "name": "flying",
            "url": "/api/v2/type/3/"
        },
        {
            "name": "poison",
            "url": "/api/v2/type/4/"
        },
        {
            "name": "ground",
            "url": "/api/v2/type/5/"
        },
        {
            "name": "rock",
            "url": "/api/v2/type/6/"
        },
        {
            "name": "bug",
            "url": "/api/v2/type/7/"
        },
        {
            "name": "ghost",
            "url": "/api/v2/type/8/"
        },
        {
            "name": "steel",
            "url": "/api/v2/type/9/"
        },
        {
            "name": "fire",
            "url": "/api/v2/type/10/"
        },
        {
            "name": "water",
            "url": "/api/v2/type/11/"
        },
        {
            "name": "grass",
            "url": "/api/v2/type/12/"
        },
        {
            "name": "electric",
            "url": "/api/v2/type/13/"
        },
        {
            "name": "psychic",
            "url": "/api/v2/type/14/"
        },
        {
            "name": "ice",
            "url": "/api/v2/type/15/"
        },
        {
            "name": "dragon",
            "url": "/api/v2/type/16/"
        },
        {
            "name": "dark",
            "url": "/api/v2/type/17/"
        },
        {
            "name": "fairy",
            "url": "/api/v2/type/18/"
        },
        {
            "name": "stellar",
            "url": "/api/v2/type/19/"
        },
        {
            "name": "unknown",
            "url": "/api/v2/type/10001/"
        },
        {
            "name": "shadow",
            "url": "/api/v2/type/10002/"
        }
    ]

    return <article id={id} className="pokemon-card" onClick={(event)=>{section == "store" ? onClick() : null}} > {/* Unique key and card class */}
        <img
            className="pokemon"
            id={id} // Set unique ID for potential usage
            src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonIndex}.png`}
            alt={`Sprite of ${data.name}`} // Add alt text for accessibility
        />    
        {section == "store" ? (
            <div className="product-info">
            <h2 className="title">{data.name.toUpperCase()}</h2> 
            <div className="price">
                <div className="essences-price"><GiDoubled  fontSize="1.1em" color="0ACBE6" /><span className="price-number">2000</span></div> 
                <div className="rp-price"><GiDividedSquare  fontSize="1.1em" color="gold" /> <span className="price-number">350</span></div>
            </div>
            </div> ) : <h2 className="title">{data.name.toUpperCase()}</h2> }     
    </article>
}

export default memo(pokeCard)
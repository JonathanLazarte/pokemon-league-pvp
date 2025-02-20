import {useState, memo} from 'react'
import './explore.css'
import ExplorePokemonSelection from '../ExplorePokemonSelection/index.jsx'
import { MdArrowBackIos } from "react-icons/md";
import PlayButton from '../../components/playButton/playButton.jsx'


export default memo(function Explore({setGlobalRoom, setActualSection, setPokeballs}){

	return <section className="explore-room">
	<div className='room-header'><MdArrowBackIos onClick={()=>setGlobalRoom("")} className="header-arrow" /><img src='https://raw.githubusercontent.com/jonylazarte/resources/refs/heads/main/general/mini-sr.png'/><h3>GL · EXPLORACION DE ZONA · OCULTO</h3></div>
	<ExplorePokemonSelection setPokeballs={setPokeballs}></ExplorePokemonSelection>
	<PlayButton type={"explore-room"} text={"INICIAR"} setGlobalRoom={setGlobalRoom} setActualSection={setActualSection} />
	</section>
})
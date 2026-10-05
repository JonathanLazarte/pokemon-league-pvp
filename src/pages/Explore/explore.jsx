import { useState, memo } from 'react'
import './explore.css'
import ExplorePokemonSelection from '../ExplorePokemonSelection/index.jsx'
import { MdArrowBackIos } from "react-icons/md";
import PlayButton from '../../components/playButton/playButton.jsx'
import { useDispatch } from 'react-redux'
import { setUserState } from '../../redux/slices/userInterfaceSlice.js'


export default memo(function Explore({ setGlobalRoom, setActualSection, setPokeballs }) {
	const dispatch = useDispatch()

	return <section className="explore-room">
		<div className='room-header'><MdArrowBackIos onClick={() => { setGlobalRoom(""); dispatch(setUserState('Online')) }} className="header-arrow" /><img src='https://raw.githubusercontent.com/jonylazarte/resources/refs/heads/main/general/mini-sr.png' /><h3>GL · PLAYER VS IA · INTERMEDIO</h3></div>
		<ExplorePokemonSelection setPokeballs={setPokeballs}></ExplorePokemonSelection>
		<PlayButton type={"explore-room"} text={"INICIAR"} setGlobalRoom={setGlobalRoom} setActualSection={setActualSection} />
	</section>
})
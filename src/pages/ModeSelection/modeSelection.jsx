import './modeSelection.css'
import {useState, memo} from 'react'
import Explore from '../Explore/explore.jsx'
import Pvp from '../PvpRoom/index.jsx'
import ConfirmButton from '../../components/playButton/playButton.jsx'

export default memo(function ModeSelection({socket, setActualSection, connectedUsers, setGlobalRoom, globalRoom, roomUsers, setRoomUsers}){
	const [modeSelected, setModeSelected] = useState("Pvp")
	const [mapSelected, setMapSelected] = useState("arena")
	const [modeInHover, setModeInHover] = useState()
	const [queueSelected, setQueueSelected] = useState("CLASIFICATORIA SOLO")
  	const buttonPvpStyle = modeSelected == "Pvp" ? {borderBottom:"2px solid #CDBE91",color:"#F0E6D2"} : null
  	const buttonExploreStyle = modeSelected == "Explore" ? {borderBottom:"2px solid #CDBE91 ", color:"#F0E6D2"} : null
  	

  	const handleSound = (sound) => {
      const confirmButtonClick = new Audio('/assets/sounds/confirm-button-click.mp3');
      const confirmButtonHover = new Audio('/assets/sounds/confirm-button-Hover.mp3');
      const confirmButtonCancelClick = new Audio('/assets/sounds/confirm-button-cancel-click.mp3');
      const findMatchButtonClick = new Audio('/assets/sounds/find-match-button-click.mp3');
      const findMatchButtonHover = new Audio('/assets/sounds/find-match-button-Hover.mp3');
      const menuClick = new Audio('https://github.com/jonylazarte/resources/raw/refs/heads/main/general/menu-click.mp3')

      sound == "confirm-button-click" && confirmButtonClick.play();
      sound == "confirm-button-hover" && confirmButtonHover.play();
      sound == "confirm-button-cancel-click" && confirmButtonCancelClick.play();
      sound == "find-match-button-click" && findMatchButtonClick.play();
      sound == "find-match-button-Hover" && findMatchButtonHover.play();
      sound == "menu-click" && menuClick.play();
    }

  	const pvpModeProps = {
	  	name: "arena",
	  	hoverImg: "sr-hover.png", // Include the file extension
	  	disabledImg: "sr-desabled.png", // Include the file extension
	  	enabledImg: "sr-enabled.png",
	  	subTitle: "1v1",
	  	title: "ARENA",
	  	description: "Arrasa a tus oponentes, sumérgete en peleas de uno contra uno y destruye los pokékon del enemigo en el modo de juego mas importante de LoP",
	  	queue: "CLASIFICATORIA SOLO",
	};
	const exploreModeProps = {
	  	name: "explorar",
	  	hoverImg: "sr-hover.png", // Include the file extension
	  	disabledImg: "sr-desabled.png", // Include the file extension
	  	enabledImg: "sr-enabled.png",
	  	subTitle: "1v1",
	  	title: "EXPLORAR",
	  	description: "Sube de nivel a tus Pokémon, aprende nuevas habilidades y desbloquea su verdadero potencial a medida que avanzas en la liga.",
	  	queue: "INTERMEDIO",
	};

	const queueOptionStyle = {color: "var(--gold-one)"}
  	const GameMode = ({name, hoverImg, enabledImg, disabledImg, subTitle, title, description, queue}) => {
  		return <>
  			<div className="gamemode-icons">
			<div className="gamemode-icon"  onMouseEnter={()=>setModeInHover(name)} onMouseLeave={()=>setModeInHover("")}>
				<img src={`https://raw.githubusercontent.com/jonylazarte/resources/refs/heads/main/general/${modeInHover == name ? hoverImg : mapSelected == name ? enabledImg : disabledImg}`} />
				<h3>{subTitle}</h3>
				<h1>{title}</h1>
			</div>
			</div>
			<div className="description-and-queques">
				<div>
					<div className="gamemode-description">
						<p>{description}</p>
					</div>
					<div style={queueSelected == queue ? queueOptionStyle : null} className="queueOption">
					<div className="custom-checkbox">{queueSelected == queue ? <div className="checkboxMark"></div> : null}</div><h3>{queue}</h3>
					</div>
				</div>
			</div>
  		</>
  	}

	return <>
	{!globalRoom && <section className="mode-selection">

		<header className="mode-selection-header">
			<div style={buttonPvpStyle} className="subheader-item" onClick={()=>{handleSound('menu-click'); setModeSelected("Pvp"); setMapSelected("arena"); setQueueSelected("CLASIFICATORIA SOLO")}}>PVP</div>
			<div style={buttonExploreStyle} className="subheader-item" onClick={()=>{handleSound('menu-click'); setModeSelected("Explore"); setMapSelected("explorar"); setQueueSelected("INTERMEDIO")}}>EXPLORAR</div>
		</header>
		{modeSelected == "Pvp" && <GameMode {...pvpModeProps}></GameMode>}
		{modeSelected == "Explore" && <GameMode {...exploreModeProps}></GameMode>}
		<ConfirmButton text="CONFIRMAR" type="modeSelection" setGlobalRoom={setGlobalRoom} setActualSection={setActualSection} modeSelected={modeSelected} />
		
	</section>}
	{globalRoom == "Pvp" && <Pvp socket={socket} setActualSection={setActualSection} connectedUsers={connectedUsers} setGlobalRoom={setGlobalRoom} globalRoom={globalRoom} roomUsers={roomUsers} setRoomUsers={setRoomUsers} ></Pvp>}
  	{globalRoom == "Explore" && <Explore setActualSection={setActualSection} setGlobalRoom={setGlobalRoom} ></Explore>}
	</>
})
import './header.css'
import '../playButton/playButton.css'
import PlayButton from '../playButton/playButton.jsx'
import react, {useState, useEffect, memo} from 'react'
import { GiDoubled, GiDividedSquare } from "react-icons/gi";
import { useSelector, useDispatch } from 'react-redux'
import { RiSidebarFoldFill } from "react-icons/ri";
import { selectUserInterfaceData, setActualSection} from '../../redux/slices/userInterfaceSlice.js'

	export const ToolTip = () => {
		const [windowPosition, setWindowPosition] = useState({ x:0, y:0, width:0 })
		const [showWindow, setShowWindow] = useState(false)
		const [textInElement, setTextInElement] = useState("")
		const [timeoutId, setTimeoutId] = useState(null);
		
		const ToolTipElement = () => {
			return showWindow ? <div style={{position:"fixed", left: windowPosition.x - windowPosition.width * 1.5 , top: windowPosition.y, width: windowPosition.width * 4, display: "flex", justifyContent: "center", overflow: "visible"}}><div className="header-tooltip" >{textInElement}</div></div> : null
		}
		const handleToolTip = (e, text) => {
			if (timeoutId){
     			clearTimeout(timeoutId);
    		}
    		const nuevoTimeOutId = setTimeout(()=>{
    			const elemento = e.target;
				const rect = elemento.getBoundingClientRect();

				setWindowPosition({ x: rect.left, y: rect.top + rect.height + 20, width: rect.width })
				setTextInElement(text)
				setShowWindow(true)
			},550)
			setTimeoutId(nuevoTimeOutId)		
		}
		const offToolTip = () => {
			setShowWindow(false)
			if (timeoutId) {
		      clearTimeout(timeoutId); // Cancelar el timeout si el mouse sale
		      setTimeoutId(null); // Limpiar el ID del timeout
		    }
		}

		return ({ToolTipElement, handleToolTip, offToolTip})
	}

	export default memo(function Header({globalRoom, showSideNav, setShowSideNav}){
		const user = useSelector(state => state.user)
		const {ToolTipElement, handleToolTip, offToolTip} = ToolTip()
		const selectedStyle = {background: "linear-gradient(rgba(25, 0, 0, 1.0), var(--gold-seven))", color: "#F0E6D2"}
		const dispatch = useDispatch();
		const {actualSection, userState} = useSelector(selectUserInterfaceData);

		const handleSound = (sound) => {
			const buttonPlayClick = new Audio('/general/button-play-click.mp3');
			const buttonPlayHover = new Audio('/general/button-play-hover.mp3');
			const menuClick = new Audio('/general/menu-click.mp3')

			sound == "menu-click" && menuClick.play();
			sound == "button-play-click" && buttonPlayClick.play();
			sound == "button-play-hover" && buttonPlayHover.play()
		}

		return <>
			<header style={{marginRight: `${!showSideNav ? '0px' : null}`, marginTop: `${(userState === 'In explore match' || userState === 'In normal match') ? '-110px' : '0px'}`} } className="index-header">
				<ToolTipElement/>
				<PlayButton type={"header"} text={"JUEGA"} /> 
	    		{/*!globalRoom ? <h1 onMouseEnter={()=>handleSound("button-play-hover")} className="play-button">JUEGA</h1> : <h3 className="play-button" onClick={()=>setActualSection("ModeSelection")}>SALA</h3> */}
	    		<div className="header-sections">
		      		<div onMouseLeave={()=>offToolTip()} onMouseEnter={(e)=>handleToolTip(e, "Inicio")} style={actualSection == "Inicio" ? selectedStyle : null} onClick={()=>{handleSound('menu-click'); dispatch(setActualSection("Home"));}} className="item"><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" fill-rule="evenodd" d="m21.1 6.551l.03.024c.537.413.87 1.053.87 1.757v11.256A3.4 3.4 0 0 1 18.6 23H5.4A3.4 3.4 0 0 1 2 19.588V8.332c0-.704.333-1.344.87-1.757l.029-.023l7.79-5.132a2.195 2.195 0 0 1 2.581 0zM10 13v8H8v-8.2c0-.992.808-1.8 1.8-1.8h4.4c.992 0 1.8.808 1.8 1.8V21h-2v-8z" clip-rule="evenodd"/></svg></div> <div className="icon-separator"></div>
		      		<div onMouseLeave={()=>offToolTip()} onMouseEnter={(e)=>handleToolTip(e, "Mochila")} style={actualSection == "Bag" ? selectedStyle : null} onClick={()=>{handleSound('menu-click'); dispatch(setActualSection("Bag"));}} className="item"><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 48 48"><defs><mask id="ipSMallBag0"><g fill="none" stroke-linejoin="round" stroke-width="4"><path fill="#fff" stroke="#fff" d="M6 12.6V41a2 2 0 0 0 2 2h32a2 2 0 0 0 2-2V12.6z"/><path stroke="#fff" stroke-linecap="round" d="M42 12.6L36.333 5H11.667L6 12.6v0"/><path stroke="#000" stroke-linecap="round" d="M31.555 19.2c0 4.198-3.382 7.6-7.555 7.6s-7.556-3.402-7.556-7.6"/></g></mask></defs><path fill="currentColor" d="M0 0h48v48H0z" mask="url(#ipSMallBag0)"/></svg></div> <div className="icon-separator"></div>
		      		{/*<div onMouseLeave={()=>offToolTip()} onMouseEnter={(e)=>handleToolTip(e, "Botín")} style={actualSection == "Botín" ? selectedStyle : null} onClick={()=>{handleSound('menu-click'); setActualSection("Botín")}} className="item"><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M18.326 9.215s4.9-.773 5.674-3.027h-7.507V4.4H0l2.032 2.358v2.415s5.127-.266 7.11 1.237c2.714 2.516-3.053 5.917-3.053 5.917l-.99 3.273c1.547-1.473 4.494-3.377 9.899-3.286c-2.057.65-4.125 1.665-5.735 3.286h10.925l-1.029-3.273s-7.918-4.668-.833-7.112"/></svg></div><div className="icon-separator"></div>*/}
		      		<div onMouseLeave={()=>offToolTip()} onMouseEnter={(e)=>handleToolTip(e, "Tienda")} style={actualSection == "Store" ? selectedStyle : null} onClick={()=>{handleSound('menu-click'); dispatch(setActualSection("Store"))}} className="item"><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 26 26"><path fill="currentColor" d="M18 .188c-4.315 0-7.813 1.929-7.813 4.312S13.686 8.813 18 8.813c4.315 0 7.813-1.93 7.813-4.313S22.314.187 18 .187zm7.813 5.593c-.002 2.383-3.498 4.313-7.813 4.313c-4.303 0-7.793-1.909-7.813-4.281V7.5c0 1.018.652 1.95 1.72 2.688c1.08.294 2.042.702 2.843 1.218c.993.252 2.085.406 3.25.406c4.315 0 7.813-1.929 7.813-4.312zm0 3c0 2.383-3.498 4.313-7.813 4.313c-.525 0-1.035-.039-1.531-.094a4.35 4.35 0 0 1 .781 1.781c.249.014.495.031.75.031c4.315 0 7.813-1.929 7.813-4.312zM8 11.187c-4.315 0-7.813 1.93-7.813 4.313S3.686 19.813 8 19.813c4.315 0 7.813-1.93 7.813-4.313S12.314 11.187 8 11.187m17.813.594c-.002 2.383-3.498 4.313-7.813 4.313c-.251 0-.505-.018-.75-.032c-.011.075-.017.175-.031.25c.05.151.093.3.093.47v1c.227.011.455.03.688.03c4.315 0 7.813-1.929 7.813-4.312zm0 3c-.002 2.383-3.498 4.313-7.813 4.313c-.251 0-.505-.018-.75-.032c-.011.075-.017.175-.031.25c.05.15.093.3.093.47v1c.227.011.455.03.688.03c4.315 0 7.813-1.929 7.813-4.312zm-10 2c-.002 2.383-3.498 4.313-7.813 4.313c-4.303 0-7.793-1.909-7.813-4.282V18.5c0 2.383 3.497 4.313 7.813 4.313s7.813-1.93 7.813-4.313zm0 3c-.002 2.383-3.498 4.313-7.813 4.313c-4.303 0-7.793-1.909-7.813-4.282V21.5c0 2.383 3.497 4.313 7.813 4.313s7.813-1.93 7.813-4.313z"/></svg></div> <div className="icon-separator"></div>
		      		<div className="account-coins">
		      			<div onMouseLeave={()=>offToolTip()} onMouseEnter={(e)=>handleToolTip(e, `${user.RP} RP`)} className="riot-points"><GiDividedSquare color= "#d8ad00" font-size="1.1em" /><div className="RP">{user.RP}</div></div>
		      			<div onMouseLeave={()=>offToolTip()} onMouseEnter={(e)=>handleToolTip(e, `${user.BE} Escencias azules`)} className="blue-essences"><GiDoubled color="0ACBE6" font-size="1.1em" /><div className="BE">{user.BE / 1000} K</div></div>
	      			</div>
	      			<div onClick={()=>setShowSideNav(true)} className="item" style={{ display: "flex", alignItems: "center", justifyContent: "center" , display: showSideNav ? `none` : 'flex'}}><RiSidebarFoldFill /></div>
	    		</div>
	    	</header>
		</>
		
})
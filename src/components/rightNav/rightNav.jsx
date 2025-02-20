import './rightNav.css'
import {useState, memo} from 'react'
import { BsFillPersonPlusFill, BsClipboardPlusFill, BsSearch, BsTextRight } from "react-icons/bs"
import { RiFilePaper2Fill } from "react-icons/ri";
import { IoChatboxSharp } from "react-icons/io5";
import { PiChatCenteredFill, PiXBold } from "react-icons/pi";
import { MdBugReport, MdMinimize, MdOutlineQuestionMark } from "react-icons/md";
import { FaMicrophone } from "react-icons/fa6";
import { VscTriangleRight, VscTriangleDown } from "react-icons/vsc";
import { IoIosSettings } from "react-icons/io";
import { FaRegWindowMinimize } from "react-icons/fa";
import { useSelector } from 'react-redux'

export const ToolTip = () => {
		const [windowPosition, setWindowPosition] = useState({ x:0, y:0, width:0, height:0 })
		const [showWindow, setShowWindow] = useState(false)
		const [dataToRender, setDataToRender] = useState("")
		const [timeoutId, setTimeoutId] = useState(null);
		const style = {
					position:"fixed",
					right: 300 + 10,
					top: windowPosition.y -200,
					height: "300px",
					//width: windowPosition.width,
					display: "flex", 
					justifyContent: "center",
					alignItems: "center",
					backgroundImage: `url('https://raw.githubusercontent.com/jonylazarte/resources/refs/heads/main/centered/${dataToRender.background}.jpg')`
		}
		const ToolTipElement = () => {
			return showWindow ? (
			<div className="out-box" style={style}>
					<div className="right-nav-user-tooltip">
							<div className="tooltip-user-container">
									<div className="tooltip-user-level">
											<img src="https://raw.githubusercontent.com/jonylazarte/resources/refs/heads/main/general/7201_Precision.png"/><h3>24</h3>
									</div>
									<div className="tooltip-user-info">
											<div className="tooltip-user-icon">
													<img className="tooltip-user-border" src="https://raw.githubusercontent.com/jonylazarte/resources/refs/heads/main/general/EoG_Border_150_4k.png"/>
													<img className="tooltip-user-icon-img" src={`https://raw.githubusercontent.com/jonylazarte/resources/refs/heads/main/profileicon/${dataToRender.profileIcon}.png`}></img>
											</div>
											<div className="tooltip-user-info-text">
													<h4>{dataToRender?.userName}</h4>
													<h6 className="subname">#{dataToRender?.tag}</h6>
													<span>{dataToRender.title}</span>
													<div className="separator"/>
													<span className="rank-and-points">{dataToRender?.rank?.name} ({dataToRender?.rank?.points} pts)</span>
											</div>

									</div>
									<div className="tooltip-user-status">
											<div className="user-status"><div style={{width: "10px", height: "10px"}} className="status-icon"></div>En línea</div>
									</div>								
							</div>
					</div>
			</div>) : null
		}
		const handleToolTip = (e, data) => {
			if (timeoutId){
     			clearTimeout(timeoutId);
    		}
    		const nuevoTimeOutId = setTimeout(()=>{
    		const elemento = e.target;
				const rect = elemento.getBoundingClientRect();

				setWindowPosition({ x: rect.left, y: rect.top + rect.height + 20, width: rect.width, height: rect.height })
				setDataToRender(data)
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

export default memo(function RightNav({connectedUsers, setShowChat, setSelectedUser, handleEmitGetChat, battleRequest, handleEmitBattleRequest, selectedUser}){
		const [showMenu, setShowMenu] = useState()
		const [menuPosition, setMenuPosition] = useState({ x:0, y:0 })
		const userName = localStorage.getItem('userName')
		const {ToolTipElement, handleToolTip, offToolTip} = ToolTip()
		const user = useSelector(state => state.user);

		const handleContextMenu = (e)=>{
	        e.preventDefault();
	        setSelectedUser(e.currentTarget.children[0].childNodes[0].childNodes[0].data)
	        setShowMenu(true);
	        setMenuPosition({ x: e.clientX, y: e.clientY })
	  	}

	  	const inviteBox = (userName) => {
	    	const userRequest = battleRequest.find(request => request.from == userName )
	    	return userRequest && (
	    			<div /*styles={{height:'200px'}}*/ className="invitation-box">
	                  <span>{userName} te ha invitado a un enfrentamiento</span>
	    							<div><button onClick={()=>handleEmitAcceptBattleRequest(userRequest.roomId)}>Aceptar</button>
	    							<button>Rechazar</button></div>
	    			</div>)
	  	}

	  	const ProfileBox = () => {
	  		const [userStatus, setUserStatus] = useState("En línea");
	  		const [iconIsInHover, setIconIsInHover] = useState(false);
	  		const showPerfilSpanStyle = iconIsInHover ? {marginLeft: "100px", visibility: "visible"} : null

		  	return <div style={{position: "relative"}} className="user-info">
						<div onMouseEnter={()=>setIconIsInHover(true)} onMouseLeave={()=>setIconIsInHover(false)} className="userLevelBarContainer">
							<div className="userLevelBar">
								<div className="icon-border" >
									<img className="user-icon" src={`https://raw.githubusercontent.com/jonylazarte/resources/refs/heads/main/profileicon/${user.profileIcon}.png`}></img>
								</div>
							</div>
							<div className="user-level">{user.level}</div>
						</div>
						<div className="user-state">
								<div className="user-options"><MdOutlineQuestionMark className="accountOptionIcon" /><MdMinimize className="accountOptionIcon" /><IoIosSettings className="accountOptionIcon" /><PiXBold className="accountOptionIcon" /></div>
								{!iconIsInHover && <>
									<h3 style={{fontSize: "18px"}}>{user.userName}</h3>
									<div className="user-status" onClick={()=>setUserStatus(prevState=>!prevState)}>
										<div className="status-icon"></div>
										{userStatus ? "En línea" : "Desconectado"}
									</div>
								</>}
						</div> 
						<span className="showPerfilSpan" style={showPerfilSpanStyle}>Ver perfil</span>
				</div>
	  	}

	  	const UserFriendList = () => {
	  		const [isFolderOpen, setIsFolderOpen] = useState(true)
	  		const iconStyle = isFolderOpen ? {transform: "rotate(90deg)"} : null
	  		const folderStyle = !isFolderOpen ? {display: "none"} : null

	  		return connectedUsers.map(folder => (
					<ul className="general-user-list">
							<div className="user-folder-name" onClick={()=>{setIsFolderOpen(prevState=>!prevState)}}>
								<VscTriangleRight style={iconStyle} className="triangle"/>
						   				{folder.name.toUpperCase() + " "}({folder.users.length}/{folder.users.length})
							</div>
							<div style={folderStyle}>{folder.users.map(user=>{
							 	return /* user.userName != userName && */ (
							 	!battleRequest.find(br=> br.from == user.userName) ? <li onMouseLeave={()=>offToolTip()} onMouseEnter={(e)=>handleToolTip(e, user)} className="user-box" key={user.userName} onClick={(e)=>{setSelectedUser(e.currentTarget.children[1].childNodes[0].childNodes[0].data);setShowChat(true) }}  onContextMenu={handleContextMenu} >
							 			<div className="icon-border mini">
							 				<img className="user-icon mini" src={`https://raw.githubusercontent.com/jonylazarte/resources/refs/heads/main/profileicon/${user.profileIcon}.png`}></img>
							 				<div className="box-status-icon"/>
							 			</div>
										<div className="user-box-data"><h5>{user.userName != userName ? user.userName : "Asmongold21"}</h5><h5 className="right-nav-status">En linea</h5></div>
							 	</li> : inviteBox(user.userName) ) })}
			        		</div>
					</ul>))
	  	}


	return <div className="right-nav" onClick={()=>setShowMenu(false)}>
			<ToolTipElement/>
			<ProfileBox/>
			<div className="online-users" >
		      {showMenu && (
		        <div className="custom-menu" style={{position:"fixed", left: menuPosition.x, top: menuPosition.y }}>
		          	<h5 className={selectedUser == userName ? "blocked" : null} onClick={()=> {setShowMenu(false); selectedUser != userName && handleEmitBattleRequest()}} >Invitar a una partida</h5>
		           	<h5 onClick={()=>setShowMenu(false)}>Ver perfil</h5>
		        </div>
		      )}
					<div className="social-menu">
							SOCIAL 
							<div className="social-icons">
									<BsFillPersonPlusFill className="social-icon"/>
									<BsClipboardPlusFill className="social-icon"/>
									<BsTextRight className="social-icon"/> 
									<BsSearch className="social-icon"/>
							</div>
					</div>
					{UserFriendList()}
			</div>
      <div className="right-nav-buttom-buttons">
      		<button onClick={()=>setShowChat(prev=>!prev)} className="right-nav-buttom-button">< PiChatCenteredFill /></button>
      		<button className="right-nav-buttom-button"><RiFilePaper2Fill /></button>
      		<button className="right-nav-buttom-button"><FaMicrophone /></button>
      		<span className="actual-version">25.51.2</span>
      		<button className="right-nav-buttom-button"><MdBugReport /></button>
      </div>

	</div>
})
import {useState, useEffect, memo} from 'react'
import { useSelector } from 'react-redux'
import { v4 as uuidv4 } from 'uuid';
import './styles.css';
import PlayButton from '../../components/playButton/playButton.jsx'
import { MdArrowBackIos } from "react-icons/md";



export default memo(function({socket, setActualSection, connectedUsers, setGlobalRoom, globalRoom, roomUsers, setRoomUsers}){

	const [createdRoom, setCreatedRoom] = useState()
	const [roomId, setRoomId] = useState()
	const newRoom = uuidv4()
    const userName = localStorage.getItem("userName");
    const user = useSelector(state => state.user);

    /*useEffect(()=>{
        const lobbyIntro = new Audio('./assets/sounds/lobby-intro.mp3')
        setTimeout(()=>{
            lobbyIntro.play();
        },650)
        
    },[])*/

	const handleEmitJoinRoom = () => {
      socket.current.emit('join-room', { roomId : newRoom })
    }
    
    useEffect(()=>{
        socket.current.on('USER JOINED',({room, roomId})=>{
        setRoomId(roomId)
        //setActualSection("PvpRoom")
        setRoomUsers(room)
       /* setRoomUsers(prevRoomUsers => {
          const newRoomUsers = roomUsers;
          newRoomUsers.push(userJoined);
          return newRoomUsers
        })*/
      	const indexRoom = room.findIndex(id => id == socket.current.id)
      	const currentPlayer = indexRoom == 0 ? "One" : "Two"
      	localStorage.setItem('currentPlayer', currentPlayer)
        localStorage.setItem('roomId', roomId)
        if(room.length == "2"){socket.current.emit('start-match', ({roomId}))}
    	})
        return ()=> socket?.current?.off('USER JOINED')
    },[]) 

    useEffect(()=>{
        socket.current.on('USER-OUT',({newRoom})=>{
        setRoomUsers(newRoom)
        
      })
        return ()=> socket.current.off('USER-OUT')
    },[])

    useEffect(()=>{
        socket.current.on('find-opponent',({roomId})=>{
        console.log(roomId)
        socket.current.emit('join-room', { roomId : roomId })
        
      })
        return ()=> socket.current.off('find-opponent')
    },[])

	return <section className="pvp-room">
            <div className='room-header'><MdArrowBackIos onClick={()=>setGlobalRoom("")} className="header-arrow" /><img src='https://raw.githubusercontent.com/jonylazarte/resources/refs/heads/main/general/mini-sr.png'/><h3>GL · CLASIFICATORIA SOLO · RECLUTAMIENTO</h3></div>
		   		<div className="room-users">
                    <div className="room-user">
                        <img className="user-banner" src="https://raw.githubusercontent.com/jonylazarte/resources/refs/heads/main/general/banner.png"/>
                        <div className="user-banner-info-container">
                            <div className="banner-user-icon">
                                <img className="banner-user-border" src="https://raw.githubusercontent.com/jonylazarte/resources/refs/heads/main/general/EoG_Border_150_4k.png"/>
                                <img className="banner-user-icon-img" src={`https://raw.githubusercontent.com/jonylazarte/resources/refs/heads/main/profileicon/${user.profileIcon}.png`}></img>
                            </div>
                            <h2>{user.alias}</h2>
                            <span>{user.title}</span> 
                        </div>
                    </div>
                    {roomUsers?.map((roomUserId, index)=>{
                    const roomUser = connectedUsers?.find(cu => cu.socketID == roomUserId)
                    return <div className="room-user">
                        <img className="user-banner" src="https://raw.githubusercontent.com/jonylazarte/resources/refs/heads/main/general/banner.png"/>
                        <div className="user-banner-info-container">
                            <div className="banner-user-icon">
                                <img className="banner-user-border" src="https://raw.githubusercontent.com/jonylazarte/resources/refs/heads/main/general/EoG_Border_150_4k.png"/>
                                <img className="banner-user-icon-img" src={`https://raw.githubusercontent.com/jonylazarte/resources/refs/heads/main/profileicon/${roomUser?.profileIcon}.png`}></img>
                            </div>
                            <h2>{roomUser.userName}</h2>
                            <span>{roomUsers.title}</span> 
                        </div>
                    </div>
                    })
                    }
		  		</div>
		   	<PlayButton type={"pvp-room"} text={"BUSCAR PARTIDA"} socket={socket} setRoomId={setRoomId} setGlobalRoom={setGlobalRoom} setActualSection={setActualSection} ></PlayButton>
   		</section>
})
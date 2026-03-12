import './index.css'
import { lazy, Suspense } from 'react';
const  PokemonSelection = lazy(() => import('../PokemonSelection/index.jsx'));//import PokemonSelection from '../PokemonSelection/index.jsx'
const  ModeSelection = lazy(() => import('../ModeSelection/modeSelection.jsx'));//import ModeSelection from '../ModeSelection/modeSelection.jsx'
const  MatchVsIa = lazy(() => import('../IaMatch/IaMatch.jsx'));//import MatchVsIa from '../IaMatch/IaMatch.jsx'
const  Bag = lazy(() => import('../Bag/bag.jsx'));//import Bag from '../Bag/bag.jsx'
const  Store = lazy(() => import('../Store/store.jsx'));//import Store from '../Store/store.jsx'
import RightNav from '../../components/rightNav/rightNav.jsx'
import Header from '../../components/header/header.jsx'
import Chat from '../../components/chat/chat.jsx'
import react, {useState, useEffect, useRef} from 'react'
import {io} from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';
import {useLocation} from 'wouter'
import { setUser, setUserMessages } from '../../redux/slices/userSlice.js'
import { selectUserInterfaceData, setActualSection, setUserState } from '../../redux/slices/userInterfaceSlice.js'
import { getUserPokemon, selectUserPokemonData } from '../../redux/slices/userPokemonSlice.js'
import { getUserItems, selectUserItemsData } from '../../redux/slices/userItemsSlice.js'
import { useSelector, useDispatch } from 'react-redux'
import {Riple} from 'react-loading-indicators'


export default function Index({setToken}){
	  const {VITE_API_URL : API_URL} = import.meta.env;
    const [showSideNav, setShowSideNav] = useState(window.innerWidth > 1200 ? true : false)
    const [connectedUsers, setConnectedUsers] = useState([])
    const [battleRequest, setBattleRequest] = useState([])
    const [path, setLocation] = useLocation()
    const [battleVisible, setBattleVisible] = useState(false)
    const [actualSectionn, setActualSectionn] = useState("Inicio")
    const [selectedUser, setSelectedUser] = useState("")
    const socket = useRef(null)
    const newRoom = uuidv4()
    const token = localStorage.getItem('token')
    const [showChat, setShowChat] = useState(false)
    const [roomId, setRoomId] = useState()
    const [globalRoom, setGlobalRoom] = useState()
    const [roomUsers, setRoomUsers] = useState([])
    const dispatch = useDispatch();
    const user = useSelector((state) => state.user);
    const { actualSection, userState } = useSelector(selectUserInterfaceData)
    const {loading : userPokemonLoading, userPokemon, error : userPokemonError} = useSelector(selectUserPokemonData);
    const {loading : userItemsLoading, userItems, error : userItemsError} = useSelector(selectUserItemsData);

    const indexElementStyle = /*{!showSideNav ? {paddingRight: "0px"} : (userState === 'In explore match' || userState === 'In normal match') ? {paddingTop: '0px'} : null}*/
    { paddingRight: !showSideNav || userState === 'In explore match' ? `0px` : null,
      paddingTop: (userState === 'In explore match' || userState === 'In normal match') ? '0px' : null };

    useEffect(()=>{
      dispatch(getUserPokemon(token))
      dispatch(getUserItems(token))
      !user.id ? fetch(`${API_URL}pokemons/users/getUserData`,{
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ token })
      })
      .then(response => response.json())
      .then(data => {
        if(data.message !== "Usuario no encontrado"){
          dispatch(setUser(data))
        } else {
          setToken()
        }
      }) : null
    },[])

    useEffect(()=>{
      socket.current = io(`${API_URL}`,{ auth: {token}})
      return () => {
        socket.current.disconnect();
      };
    },[])


	 useEffect(()=>{
      user.id && socket.current.emit('authenticate',({userName: user.userName}))
      return ()=> socket.current.off('authenticate')
    },[user])

	  useEffect(()=>{
      socket.current.on('battle-mailbox', (msg)=>{
      const request =  [{roomId : msg.roomId , from : msg.from, to : msg.from}] ;
      setBattleRequest(request)
      setTimeout(()=>{setBattleRequest([])}, 7000)
    })
      return ()=> socket.current.off(token)
    },[])

	  useEffect(()=>{
      socket.current.on('user-list',(msg)=>{
        const actualUserIndex = msg.findIndex(u => u.userName == user.userName);
        msg.splice(actualUserIndex, 1);
        const friendFolders = [
          {
            name : "general",
            users: msg
          }
        ] 
        setConnectedUsers(friendFolders)
      })
      return ()=> socket.current.off('user-list')
    },[])

    /*useEffect(()=>{
      socket.current.on('get-chat',(msg)=>{
        setChatMessages(msg)
      })
      return ()=> socket.current.off('get-chat')
    },[])*/

    useEffect(()=>{
      socket.current.on('chat-message',(msg)=>{
          /*const newMessages = chatMessages
          newMessages.push(msg)*/
        /*setChatMessages(prevChatMessages=>{
          const newChatMessages = prevChatMessages;
          newChatMessages.push({from: msg.from, message: msg.message})
          return newChatMessages
        })*/
        //setChatMessages(prevChatMessages => [...prevChatMessages, msg ])
        dispatch(setUserMessages(msg))
      })
      return ()=> socket.current.off('chat-message')
    },[])

    useEffect(()=>{
      socket.current.on('start-match',(msg)=>{
        dispatch(setUserState('In normal match'))
        dispatch(setActualSection("PokemonSelection"))
      })
      return ()=> socket.current.off('start-match')
    },[])
    

    const handleEmitChatMessage = ({e, chatInput})=>{
      e.preventDefault()
      console.log("to: " + selectedUser + " from: " + user.userName)
      socket.current.emit('chat-message',({ to: selectedUser, from : user.userName, message : chatInput}))
    }
    
    const handleEmitBattleRequest = ()=>{
    	// const roomId = uuidv4() //"za3C--1VvKC8pOkqAAAM"//
    	socket.current.emit('battle-request', ( {to : selectedUser, from : user.userName, roomId : localStorage.getItem('roomId') } ))
    	// socket.current.emit('join-room',{ roomId : room })
    }

    const handleEmitAcceptBattleRequest = (roomId) =>{
      setActualSection('ModeSelection');
    	socket.current.emit('join-room',{ roomId })
    }


    useEffect(() => {
      if(userState === 'In explore match' || userState === 'In normal match'){
        setShowSideNav(false)
      } else if( !showSideNav && window.innerWidth > 1200){
        setShowSideNav(true);
      }
    }, [userState])
    
	return user.id ? <div style={indexElementStyle} className="index">

		<Header globalRoom={globalRoom} showSideNav={showSideNav} setShowSideNav={setShowSideNav}></Header>

		<RightNav socket={socket} setToken={setToken} showSideNav={showSideNav} setShowSideNav={setShowSideNav} showChat={showChat} connectedUsers={connectedUsers} setShowChat={setShowChat} setSelectedUser={setSelectedUser} handleEmitBattleRequest={handleEmitBattleRequest} battleRequest={battleRequest} selectedUser={selectedUser}></RightNav>

    <Chat showChat={showChat} selectedUser={selectedUser} connectedUsers={connectedUsers} chatMessages={user.messages} handleEmitChatMessage={handleEmitChatMessage}></Chat>


   {actualSection == "Home" && <section className="inicio"></section>}
   {actualSection == "Bag" && <Suspense fallback={<div className="loading"><Riple color="var(--gold-one)" size="medium" text="" textColor="" /></div>}><Bag/></Suspense>}
   {actualSection == "Store" && <Suspense fallback={<div className="loading"><Riple color="var(--gold-one)" size="medium" text="" textColor="" /></div>}><Store/></Suspense>}
   {actualSection == "ModeSelection" && <Suspense fallback={<div className="loading"><Riple color="var(--gold-one)" size="medium" text="" textColor="" /></div>}><ModeSelection socket={socket} setGlobalRoom={setGlobalRoom} globalRoom={globalRoom} roomUsers={roomUsers} setRoomUsers={setRoomUsers}></ModeSelection></Suspense>}
	 {actualSection == "PokemonSelection" && <Suspense fallback={<div className="loading"><Riple color="var(--gold-one)" size="medium" text="" textColor="" /></div>}><PokemonSelection roomId={localStorage.getItem('roomId')} socket={socket} ></PokemonSelection></Suspense>}
   {actualSection == "IaMatch" && <Suspense fallback={<div className="loading"><Riple color="var(--gold-one)" size="medium" text="" textColor="" /></div>}><MatchVsIa socket={socket} ></MatchVsIa></Suspense>}

		</div> : <div className='loadingScreen'/*style={{position: 'fixed', top: '50vh', left: '50vw'}}*/>
                {/*<svg style={{height: "45px", width: "45px"}} fill="hsl(228, 97%, 42%)" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z" opacity=".25"/><path d="M12,4a8,8,0,0,1,7.89,6.7A1.53,1.53,0,0,0,21.38,12h0a1.5,1.5,0,0,0,1.48-1.75,11,11,0,0,0-21.72,0A1.5,1.5,0,0,0,2.62,12h0a1.53,1.53,0,0,0,1.49-1.3A8,8,0,0,1,12,4Z"><animateTransform attributeName="transform" type="rotate" dur="0.75s" values="0 12 12;360 12 12" repeatCount="indefinite"/></path></svg>*/}
                <div className="wrapper"><div className="pokeball"></div></div>
             </div>
}
import './index.css'
import { lazy, Suspense } from 'react';
const  PokemonSelection = lazy(() => import('../PokemonSelection/index.jsx'));//import PokemonSelection from '../PokemonSelection/index.jsx'
const  ModeSelection = lazy(() => import('../ModeSelection/modeSelection.jsx'));//import ModeSelection from '../ModeSelection/modeSelection.jsx'
const  MatchVsIa = lazy(() => import('../IaMatch/IaMatch.jsx'));//import MatchVsIa from '../IaMatch/IaMatch.jsx'
const  Bag = lazy(() => import('../Bag/bag.jsx'));//import Bag from '../Bag/bag.jsx'
const  Store = lazy(() => import('../Store/store.jsx'));//import Store from '../Store/store.jsx'
import RightNav from '../../components/RightNav/rightNav.jsx'
import Header from '../../components/header/header.jsx'
import Chat from '../../components/chat/chat.jsx'
import react, {useState, useEffect, useRef} from 'react'
import {io} from 'https://cdn.socket.io/4.8.0/socket.io.esm.min.js'
import { v4 as uuidv4 } from 'uuid';
import {useLocation} from 'wouter'
import {getPokemon} from '../../store/actions/pokemonActions.js'
import { setUser } from '../../redux/slices/userSlice.js'
import {useSelector, useDispatch} from 'react-redux'


export default function Index(){
	  const {VITE_API_URL : API_URL} = import.meta.env;
    const [connectedUsers, setConnectedUsers] = useState([])
    const [battleRequest, setBattleRequest] = useState([])
    const [chatMessages, setChatMessages] = useState([])
    const [path, setLocation] = useLocation()
    const [battleVisible, setBattleVisible] = useState(false)
    const [actualSection, setActualSection] = useState("Inicio")
    const [selectedUser, setSelectedUser] = useState("")
    const socket = useRef(null)
    const newRoom = uuidv4()
    const token = localStorage.getItem('token')
    const userName = localStorage.getItem('userName')
    const [showChat, setShowChat] = useState(false)
    const [roomId, setRoomId] = useState()
    const [globalRoom, setGlobalRoom] = useState()
    const [roomUsers, setRoomUsers] = useState([])
    const [items, setItems] = useState()
    const dispatch = useDispatch();
    const {loading, pokemonStore, error} = useSelector(state => {return state.pokemonReducer})
    const user = useSelector((state) => state.user);

    useEffect(()=>{
      dispatch(getPokemon(`users/pokemon`))
      !items && fetch(`${API_URL}pokemons/users/getItems`,{
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ userID : token })
      })
      .then(response => response.json())
      .then(data => {
        setItems(data)
      });
      fetch(`${API_URL}pokemons/users/getUserData`,{
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ userName : userName })
      })
      .then(response => response.json())
      .then(data => {
        dispatch(setUser(data))
        setChatMessages(data.messages)
      });
    },[])

    useEffect(()=>{
      socket.current = io(`${API_URL}`,{ auth: {token}})
      return () => {
      socket.current.disconnect();
    };
    },[])


	 useEffect(()=>{
      user && socket.current.emit('authenticate',({userName}))
      return ()=> socket.current.off('authenticate')
    },[])

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
        const actualUserIndex = msg.findIndex(user => user.userName == userName);
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

    useEffect(()=>{
      socket.current.on('get-chat',(msg)=>{
        setChatMessages(msg)
      })
      return ()=> socket.current.off('get-chat')
    },[])

    useEffect(()=>{
      socket.current.on('chat-message',(msg)=>{
          /*const newMessages = chatMessages
          newMessages.push(msg)*/
        /*setChatMessages(prevChatMessages=>{
          const newChatMessages = prevChatMessages;
          newChatMessages.push({from: msg.from, message: msg.message})
          return newChatMessages
        })*/
        setChatMessages(prevChatMessages => [...prevChatMessages, msg ])
      })
      return ()=> socket.current.off('chat-message')
    },[])

    useEffect(()=>{
      socket.current.on('start-match',(msg)=>{
        setActualSection("PokemonSelection")
      })
      return ()=> socket.current.off('start-match')
    },[])
    
    const handleEmitGetChat = (to)=>{
      //socket.current.emit('get-chat',({to}))
    }
    const handleEmitChatMessage = ({e, chatInput})=>{
      e.preventDefault()
      socket.current.emit('chat-message',({ to: selectedUser, from : userName, message : chatInput}))
    }
    
    const handleEmitBattleRequest = ()=>{
    	// const roomId = uuidv4() //"za3C--1VvKC8pOkqAAAM"//
    	socket.current.emit('battle-request', ( {to : selectedUser, from : userName, roomId : localStorage.getItem('roomId') } ))
    	// socket.current.emit('join-room',{ roomId : room })
    }

    const handleEmitAcceptBattleRequest = (roomId) =>{
      setActualSection('ModeSelection');
    	socket.current.emit('join-room',{ roomId })
    }



    
	return <div className="index">

		<Header globalRoom={globalRoom} actualSection={actualSection} setActualSection={setActualSection}></Header>

		<RightNav showChat={showChat} connectedUsers={connectedUsers} setShowChat={setShowChat} setSelectedUser={setSelectedUser} handleEmitGetChat={handleEmitGetChat} handleEmitBattleRequest={handleEmitBattleRequest} battleRequest={battleRequest} selectedUser={selectedUser}></RightNav>

    <Chat showChat={showChat} selectedUser={selectedUser} connectedUsers={connectedUsers} chatMessages={chatMessages} handleEmitChatMessage={handleEmitChatMessage}></Chat>


   {actualSection == "Inicio" && <section className="inicio"></section>}
   {actualSection == "Bag" && <Suspense fallback={<div className="loading">Loading...</div>}><Bag/></Suspense>}
   {actualSection == "Store" && <Suspense fallback={<div className="loading">Loading...</div>}><Store userItems={items}/></Suspense>}
   {actualSection == "ModeSelection" && <Suspense fallback={<div className="loading">Loading...</div>}><ModeSelection socket={socket} setActualSection={setActualSection} setGlobalRoom={setGlobalRoom} globalRoom={globalRoom} roomUsers={roomUsers} setRoomUsers={setRoomUsers}></ModeSelection></Suspense>}
	 {actualSection == "PokemonSelection" && <Suspense fallback={<div className="loading">Loading...</div>}><PokemonSelection roomId={localStorage.getItem('roomId')} socket={socket} setActualSection={setActualSection}  ></PokemonSelection></Suspense>}
   {actualSection == "IaMatch" && <Suspense fallback={<div className="loading">Loading...</div>}><MatchVsIa socket={socket} setActualSection={setActualSection} itemsOne={items}></MatchVsIa></Suspense>}

		</div>
}
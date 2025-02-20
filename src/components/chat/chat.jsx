import {useState, useEffect, memo} from 'react'
import { useSelector } from 'react-redux'
import './chat.css'


export default memo(function({showChat, selectedUser, chatMessages, handleEmitChatMessage, connectedUsers}){
	const [chatInput, setChatInput] = useState("")
	const user = useSelector(state => state.user);
	const userSelectedInfo = connectedUsers[0]?.users?.find(u => u.userName == selectedUser);

	useEffect(()=>{
		const openChat = new Audio('https://github.com/jonylazarte/resources/raw/refs/heads/main/general/menu-click.mp3');
		showChat && openChat.play();
	},[showChat])

	return <>
		{showChat && <div className="chat">
        	<div className="chatHead">
        		{selectedUser && <div style={{marginRight: "10px"}} className="icon-border mini">
			 		<img className="user-icon mini" src={`https://raw.githubusercontent.com/jonylazarte/resources/refs/heads/main/profileicon/${userSelectedInfo?.profileIcon}.png`}></img>
			 		<div className="box-status-icon"/>
				</div>}
       			{selectedUser ? selectedUser : "Selecciona un chat"}
        	</div>
        	<div className="chat-messages">{chatMessages && chatMessages.map(cm =>  (cm.from == selectedUser && <span style={{textAlign:"left"}} >{cm.message}</span> || cm.to == selectedUser && <span style={{textAlign:"right"}}>{cm.message}</span>) )}</div>
        	<form onSubmit={(e)=>{handleEmitChatMessage({chatInput,e});setChatInput("")}} className="chat-form"><input value={chatInput} onChange={(e)=>setChatInput(e.currentTarget.value)} className="input-chat" placeholder={"Escribe aquí..."}></input></form>
      	</div>}
      </>
})
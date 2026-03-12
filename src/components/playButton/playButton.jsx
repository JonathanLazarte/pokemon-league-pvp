import { useState, useEffect } from 'react'
import { selectUserInterfaceData, setActualSection, setUserState } from '../../redux/slices/userInterfaceSlice.js'
import { useDispatch, useSelector } from 'react-redux'
import './playButton.css'

export default function PlayButton({setRoomId, globalRoom, setGlobalRoom, socket, type, text, modeSelected, okButtonAction}){
	const [secondsPasseds, setSecondsPasseds] = useState(0)
	const [minutesPasseds, setMinutesPasseds] = useState(0)
    const [textInButton, setTextInButton] = useState(text)
  	const [inQueque, setInQueque] = useState(false)
    const [isButtonSelected, setIsButtonSelected] = useState(false)
    const dispatch = useDispatch();
    const { actualSection, userState } = useSelector(selectUserInterfaceData);

    useEffect(()=>{
        if(type === 'header' && (userState === 'Explore' || userState === 'Pvp')){
            setTextInButton('GRUPO')
        } else if(type === 'header') {
            setTextInButton('JUEGA')
        }
        //setTextInButton(text)
    },[userState])

  	const handleEmitLeaveRoom = () => {
        socket?.current?.emit('leave-room', { roomId })
    }

    const handleEmitStartMatch = ()=>{
        /*roomUsers.length == 1 ? socket.current.emit('start-match', ({roomId})) :*/ socket?.current?.emit('find-opponent')
        setInQueque(true)
    }

    const handleSound = (sound) => {
        const confirmButtonClick = new Audio('/general/confirm-button-click.mp3');
        const confirmButtonHover = new Audio('/general/confirm-button-hover.mp3');
        const confirmButtonCancelClick = new Audio('/general/confirm-button-cancel-click.mp3');
        const findMatchButtonClick = new Audio('/general/find-match-button-click.mp3');
        const findMatchButtonHover = new Audio('/general/find-match-button-hover.mp3');
        const buttonPlayClick = new Audio('/general/button-play-click.mp3');
        const buttonPlayHover = new Audio('/general/button-play-hover.mp3');

        sound == "confirm-button-click" && confirmButtonClick.play();
        sound == "confirm-button-hover" && confirmButtonHover.play();
        sound == "confirm-button-cancel-click" && confirmButtonCancelClick.play();
        sound == "find-match-button-click" && findMatchButtonClick.play();
        sound == "find-match-button-Hover" && findMatchButtonHover.play();
        sound == "button-play-click" && buttonPlayClick.play();
        sound == "button-play-hover" && buttonPlayHover.play()
    }

    const outButtonClickActions = () => {
              
        if(type == "pvp-room"){
            handleSound('confirm-button-cancel-click');
            dispatch(setUserState('Online'));
            setRoomId();
            setGlobalRoom();
            dispatch(setActualSection("Home"));
            handleEmitLeaveRoom()
        }
        if(type == "explore-room" | type == "modeSelection"){
            handleSound('confirm-button-cancel-click');
            setGlobalRoom();
            dispatch(setActualSection("Home"));
            dispatch(setUserState('Online'));
        }
    }

    const okButtonClickActions = () => {

        if(type == "pvp-room"){
            handleSound('find-match-button-click');
            setSecondsPasseds(0)
            handleEmitStartMatch();
        }
        if(type == "explore-room"){
            dispatch(setActualSection("IaMatch"));
            dispatch(setUserState('In explore match'))
        }
        if(type == "header"){
            handleSound('button-play-click');
            actualSection != 'ModeSelection' ? dispatch(setActualSection("ModeSelection")) : null;
        }
        if(type == "modeSelection"){
            handleSound('confirm-button-click');
            dispatch(setUserState(modeSelected));
            setGlobalRoom(modeSelected);
        }
        if(type == "arenaPokemonSelection"){
            okButtonAction();
        }

    }

    useEffect(() => {
        const interval = setInterval(() => {
        
            if(secondsPasseds == 59){
            	setSecondsPasseds(0);
            	setMinutesPasseds(minutesPasseds + 1)
            } else{
            	setSecondsPasseds(secondsPasseds + 1);
            }

        }, 1000);
        // Limpiar el intervalo cuando el componente se desmonte
        return () => clearInterval(interval);
    }, [secondsPasseds]);

	return (
      <div className="play-and-out-button">
    	    {type != "header" && type != "return-to-room" ? <div className="out-button-border">
              <div translate="no" onClick={()=>outButtonClickActions()} className="out-button">X</div>
          </div> : <div className="gameLogoContainer"><div className="gameLogo"></div></div>}
          <div className={`box-play-button ${actualSection == "ModeSelection" && type == 'header' ? 'selected' : null} ${userState != 'Online' && type == 'header' ? 'selected' : null}`}>
              <div className={`border-play-button ${actualSection == "ModeSelection" && type == 'header' ? 'selected' : null} ${userState != 'Online' && type == 'header' ? 'selected' : null}`}>
                  <div className={`circunferense ${actualSection == "ModeSelection" && type == 'header' ? 'selected' : null} ${userState != 'Online' && type == 'header' ? 'selected' : null}`}></div>
                  <h3 onMouseEnter={()=>handleSound('find-match-button-hover')} onClick={()=>{ okButtonClickActions(); setIsButtonSelected(true); }} className={`play-button ${actualSection == "ModeSelection" && type == 'header' ? 'selected' : null} ${userState != 'Online' && type == 'header' ? 'selected' : null}`}>{!inQueque ? textInButton : "En cola: " + minutesPasseds + ":" + secondsPasseds}</h3>
              </div>
          </div>
    	</div>
  )
}
import {useState, useEffect} from 'react'
import './playButton.css'

export default function PlayButton({setRoomId, globalRoom, setGlobalRoom, setActualSection, socket, type, text, modeSelected, okButtonAction}){
	const [secondsPasseds, setSecondsPasseds] = useState(0)
	const [minutesPasseds, setMinutesPasseds] = useState(0)
    const [textInButton, setTextInButton] = useState(text)
  	const [inQueque, setInQueque] = useState(false)

    useEffect(()=>{
        type == "return-to-room" && setTextInButton("GRUPO")
        type == "header" && setTextInButton("JUEGA")
        setTextInButton(text)
    },[text])

  	const handleEmitLeaveRoom = () => {
        socket?.current?.emit('leave-room', { roomId })
    }

    const handleEmitStartMatch = ()=>{
        /*roomUsers.length == 1 ? socket.current.emit('start-match', ({roomId})) :*/ socket?.current?.emit('find-opponent')
        setInQueque(true)
    }

    const handleSound = (sound) => {
        const confirmButtonClick = new Audio('https://github.com/jonylazarte/resources/raw/refs/heads/main/general/confirm-button-click.mp3');
        const confirmButtonHover = new Audio('https://github.com/jonylazarte/resources/raw/refs/heads/main/general/confirm-button-hover.mp3');
        const confirmButtonCancelClick = new Audio('https://github.com/jonylazarte/resources/raw/refs/heads/main/general/confirm-button-cancel-click.mp3');
        const findMatchButtonClick = new Audio('https://github.com/jonylazarte/resources/raw/refs/heads/main/general/find-match-button-click.mp3');
        const findMatchButtonHover = new Audio('https://github.com/jonylazarte/resources/raw/refs/heads/main/general/find-match-button-hover.mp3');
        const buttonPlayClick = new Audio('https://github.com/jonylazarte/resources/raw/refs/heads/main/general/button-play-click.mp3');
        const buttonPlayHover = new Audio('https://github.com/jonylazarte/resources/raw/refs/heads/main/general/button-play-hover.mp3');

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
            setRoomId();
            setGlobalRoom();
            setActualSection("Inicio");
            handleEmitLeaveRoom()
        }
        if(type == "explore-room" | type == "modeSelection"){
            handleSound('confirm-button-cancel-click');
            setGlobalRoom();
            setActualSection("Inicio");
        }
    }

    const okButtonClickActions = () => {

        if(type == "pvp-room"){
            handleSound('find-match-button-click');
            handleEmitStartMatch();
        }
        if(type == "explore-room"){
          setActualSection("IaMatch")
        }
        if(type == "header"){
            handleSound('button-play-click');
            setActualSection("ModeSelection");
        }
        if(type == "modeSelection"){
            handleSound('confirm-button-click');
            setGlobalRoom(modeSelected);
        }
        if(type == "return-to-room"){
            setActualSection("ModeSelection")
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
          <div className="box-play-button">
              <div className="border-play-button">
                  <div className="circunferense"></div>
                  <h3 onMouseEnter={()=>handleSound('find-match-button-hover')} onClick={()=>okButtonClickActions()} className="play-button">{!inQueque ? textInButton : "En cola: " + minutesPasseds + ":" + secondsPasseds}</h3>
              </div>
          </div>
    	</div>
  )
}
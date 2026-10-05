import { useState, useEffect, useCallback, memo } from 'react';
import { setActualSection, setUserState } from '../../redux/slices/userInterfaceSlice.js';
import { useDispatch, useSelector } from 'react-redux';
import './playButton.css';

export default memo(function PlayButton({
  setRoomId,
  setGlobalRoom,
  socket,
  type,
  text,
  modeSelected,
  okButtonAction,
}) {
  const [secondsPasseds, setSecondsPasseds] = useState(0);
  const [minutesPasseds, setMinutesPasseds] = useState(0);
  const [textInButton, setTextInButton] = useState(text);
  const [inQueque, setInQueque] = useState(false);
  const dispatch = useDispatch();
  const { actualSection, userState } = useSelector((state) => state.userInterface);

  useEffect(() => {
    if (type === 'header' && (userState === 'Explore' || userState === 'Pvp')) {
      setTextInButton('GRUPO');
    } else if (type === 'header') {
      setTextInButton('JUEGA');
    } else {
      setTextInButton(text);
    }
  }, [userState, type, text]);

  const playAudio = useCallback((path) => {
    const audio = new Audio(path);
    audio.play().catch(() => {});
  }, []);

  const handleEmitLeaveRoom = useCallback(() => {
    socket?.current?.emit('leave-room');
  }, [socket]);

  const handleEmitStartMatch = useCallback(() => {
    socket?.current?.emit('find-opponent');
    setInQueque(true);
  }, [socket]);

  const outButtonClickActions = () => {
    if (type === 'pvp-room') {
      playAudio('/general/confirm-button-cancel-click.mp3');
      dispatch(setUserState('Online'));
      if (setRoomId) setRoomId(undefined);
      if (setGlobalRoom) setGlobalRoom(undefined);
      dispatch(setActualSection('Home'));
      handleEmitLeaveRoom();
    }
    if (type === 'explore-room' || type === 'modeSelection') {
      playAudio('/general/confirm-button-cancel-click.mp3');
      if (setGlobalRoom) setGlobalRoom(undefined);
      dispatch(setActualSection('Home'));
      dispatch(setUserState('Online'));
    }
  };

  const okButtonClickActions = () => {
    if (type === 'pvp-room') {
      playAudio('/general/find-match-button-click.mp3');
      setSecondsPasseds(0);
      handleEmitStartMatch();
    }
    if (type === 'explore-room') {
      dispatch(setActualSection('IaMatch'));
      dispatch(setUserState('In explore match'));
    }
    if (type === 'header') {
      playAudio('/general/button-play-click.mp3');
      if (actualSection !== 'ModeSelection') dispatch(setActualSection('ModeSelection'));
    }
    if (type === 'modeSelection') {
      playAudio('/general/confirm-button-click.mp3');
      dispatch(setUserState(modeSelected));
      if (setGlobalRoom) setGlobalRoom(modeSelected);
    }
    if (type === 'arenaPokemonSelection') {
      if (okButtonAction) okButtonAction();
    }
  };

  useEffect(() => {
    let interval = null;
    if (inQueque) {
      interval = setInterval(() => {
        setSecondsPasseds((prevSec) => {
          if (prevSec === 59) {
            setMinutesPasseds((prevMin) => prevMin + 1);
            return 0;
          }
          return prevSec + 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [inQueque]);

  const isSelected =
    (actualSection === 'ModeSelection' && type === 'header') ||
    (userState !== 'Online' && type === 'header');

  return (
    <div className="play-and-out-button">
      {type !== 'header' && type !== 'return-to-room' ? (
        <div className="out-button-border">
          <div translate="no" onClick={outButtonClickActions} className="out-button">
            X
          </div>
        </div>
      ) : (
        <div className="gameLogoContainer">
          <div className="gameLogo"></div>
        </div>
      )}
      <div className={`box-play-button ${isSelected ? 'selected' : ''}`}>
        <div className={`border-play-button ${isSelected ? 'selected' : ''}`}>
          <div className={`circunferense ${isSelected ? 'selected' : ''}`}></div>
          <h3
            onMouseEnter={() => playAudio('/general/find-match-button-hover.mp3')}
            onClick={okButtonClickActions}
            className={`play-button ${isSelected ? 'selected' : ''}`}
          >
            {!inQueque ? textInButton : `En cola: ${minutesPasseds}:${secondsPasseds < 10 ? `0${secondsPasseds}` : secondsPasseds}`}
          </h3>
        </div>
      </div>
    </div>
  );
});
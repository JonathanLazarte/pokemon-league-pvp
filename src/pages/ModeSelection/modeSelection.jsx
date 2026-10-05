import './modeSelection.css';
import { useState, memo, useCallback } from 'react';
import Explore from '../Explore/explore.jsx';
import Pvp from '../PvpRoom/index.jsx';
import ConfirmButton from '../../components/playButton/playButton.jsx';

export default memo(function ModeSelection({
  socket,
  setActualSection,
  connectedUsers,
  setGlobalRoom,
  globalRoom,
  roomUsers,
  setRoomUsers,
}) {
  const [modeSelected, setModeSelected] = useState('Pvp');
  const [mapSelected, setMapSelected] = useState('arena');
  const [modeInHover, setModeInHover] = useState('');
  const [queueSelected, setQueueSelected] = useState('CLASIFICATORIA SOLO');

  const buttonPvpStyle =
    modeSelected === 'Pvp' ? { borderBottom: '2px solid #CDBE91', color: '#F0E6D2' } : null;
  const buttonExploreStyle =
    modeSelected === 'Explore' ? { borderBottom: '2px solid #CDBE91 ', color: '#F0E6D2' } : null;

  const playClickSound = useCallback(() => {
    const menuClick = new Audio('/general/menu-click.mp3');
    menuClick.play().catch(() => {});
  }, []);

  const pvpModeProps = {
    name: 'arena',
    hoverImg: 'sr-hover.png',
    disabledImg: 'sr-desabled.png',
    enabledImg: 'sr-enabled.png',
    subTitle: '1v1',
    title: 'ARENA',
    description:
      'Arrasa a tus oponentes, sumérgete en peleas de uno contra uno y destruye los pokémon del enemigo en el modo de juego más importante de LoP.',
    queue: 'CLASIFICATORIA SOLO',
  };

  const exploreModeProps = {
    name: 'explorar',
    hoverImg: 'sr-hover.png',
    disabledImg: 'sr-desabled.png',
    enabledImg: 'sr-enabled.png',
    subTitle: '1v1',
    title: 'PLAYER VS IA',
    description:
      'Sube de nivel a tus Pokémon, aprende nuevas habilidades y desbloquea su verdadero potencial a medida que avanzas en la liga.',
    queue: 'INTERMEDIO',
  };

  const queueOptionStyle = { color: 'var(--gold-one)' };

  const GameMode = ({ hoverImg, enabledImg, disabledImg, subTitle, title, description, queue, name }) => (
    <>
      <div className="gamemode-icons">
        <div className="gamemode-icon" onMouseLeave={() => setModeInHover('')}>
          <img
            src={`https://raw.githubusercontent.com/jonylazarte/resources/refs/heads/main/general/${
              modeInHover === name ? hoverImg : mapSelected === name ? enabledImg : disabledImg
            }`}
            alt={title}
          />
          <h3>{subTitle}</h3>
          <h1>{title}</h1>
        </div>
      </div>
      <div className="description-and-queques">
        <div>
          <div className="gamemode-description">
            <p>{description}</p>
          </div>
          <div style={queueSelected === queue ? queueOptionStyle : null} className="queueOption">
            <div className="custom-checkbox">
              {queueSelected === queue ? <div className="checkboxMark"></div> : null}
            </div>
            <h3>{queue}</h3>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {!globalRoom && (
        <section className="mode-selection">
          <header className="mode-selection-header">
            <div
              style={buttonPvpStyle}
              className="subheader-item"
              onClick={() => {
                playClickSound();
                setModeSelected('Pvp');
                setMapSelected('arena');
                setQueueSelected('CLASIFICATORIA SOLO');
              }}
            >
              PVP
            </div>
            <div
              style={buttonExploreStyle}
              className="subheader-item"
              onClick={() => {
                playClickSound();
                setModeSelected('Explore');
                setMapSelected('explorar');
                setQueueSelected('INTERMEDIO');
              }}
            >
              PLAYER VS IA
            </div>
          </header>
          {modeSelected === 'Pvp' && <GameMode {...pvpModeProps} />}
          {modeSelected === 'Explore' && <GameMode {...exploreModeProps} />}
          <ConfirmButton
            text="CONFIRMAR"
            type="modeSelection"
            setGlobalRoom={setGlobalRoom}
            setActualSection={setActualSection}
            modeSelected={modeSelected}
          />
        </section>
      )}
      {globalRoom === 'Pvp' && (
        <Pvp
          socket={socket}
          setActualSection={setActualSection}
          connectedUsers={connectedUsers}
          setGlobalRoom={setGlobalRoom}
          globalRoom={globalRoom}
          roomUsers={roomUsers}
          setRoomUsers={setRoomUsers}
        />
      )}
      {globalRoom === 'Explore' && (
        <Explore setActualSection={setActualSection} setGlobalRoom={setGlobalRoom} />
      )}
    </>
  );
});
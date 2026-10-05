import { useState, useEffect, memo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import './styles.css';
import PlayButton from '../../components/playButton/playButton.jsx';
import { MdArrowBackIos } from 'react-icons/md';
import { setUserState } from '../../redux/slices/userInterfaceSlice.js';

export default memo(function PvpRoom({ socket, setGlobalRoom, roomUsers, setRoomUsers }) {
  const [, setRoomId] = useState();
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!socket?.current) return;

    const handleUserJoined = ({ room, roomId }) => {
      setRoomId(roomId);
      setRoomUsers(room);
      const indexRoom = room.findIndex((id) => id === socket.current.id);
      const currentPlayer = indexRoom === 0 ? 'One' : 'Two';
      localStorage.setItem('currentPlayer', currentPlayer);
      localStorage.setItem('roomId', roomId);
      if (room.length === 2) {
        socket.current.emit('start-match', { roomId });
      }
    };

    const handleUserOut = ({ newRoom }) => {
      setRoomUsers(newRoom);
    };

    const handleFindOpponent = ({ roomId }) => {
      socket.current.emit('join-room', { roomId });
    };

    socket.current.on('USER JOINED', handleUserJoined);
    socket.current.on('USER-OUT', handleUserOut);
    socket.current.on('find-opponent', handleFindOpponent);

    return () => {
      socket.current?.off('USER JOINED', handleUserJoined);
      socket.current?.off('USER-OUT', handleUserOut);
      socket.current?.off('find-opponent', handleFindOpponent);
    };
  }, [socket, setRoomUsers]);

  return (
    <section className="pvp-room">
      <div className="room-header">
        <MdArrowBackIos
          onClick={() => {
            dispatch(setUserState('Online'));
            setGlobalRoom();
          }}
          className="header-arrow"
        />
        <img
          src="https://raw.githubusercontent.com/jonylazarte/resources/refs/heads/main/general/mini-sr.png"
          alt="Ranking"
        />
        <h3>GL · CLASIFICATORIA SOLO · RECLUTAMIENTO</h3>
      </div>
      <div className="room-users">
        <div className="room-user">
          <img className="user-banner" src="/general/banner.png" alt="Banner" />
          <div className="user-banner-info-container">
            <div className="banner-user-icon">
              <img
                className="banner-user-border"
                src="/general/EoG_Border_150_4k.png"
                alt="Border"
              />
              <img
                className="banner-user-icon-img"
                src={`https://raw.githubusercontent.com/jonylazarte/resources/refs/heads/main/profileicon/${user.profileIcon}.png`}
                alt="Avatar"
              />
            </div>
            <h2>{user.alias}</h2>
            <span>{user.title}</span>
          </div>
        </div>
      </div>
      <PlayButton
        type="pvp-room"
        text="BUSCAR PARTIDA"
        socket={socket}
        setRoomId={setRoomId}
        setGlobalRoom={setGlobalRoom}
      />
    </section>
  );
});
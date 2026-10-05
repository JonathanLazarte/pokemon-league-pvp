import './index.css';
import { lazy, Suspense, useState, useEffect, useRef, useCallback, memo } from 'react';
import RightNav from '../../components/rightNav/rightNav.jsx';
import Header from '../../components/header/header.jsx';
import Chat from '../../components/chat/chat.jsx';
import { io } from 'socket.io-client';
import { setUser, setUserMessages } from '../../redux/slices/userSlice.js';
import { selectUserInterfaceData, setActualSection, setUserState } from '../../redux/slices/userInterfaceSlice.js';
import { getUserPokemon } from '../../redux/slices/userPokemonSlice.js';
import { getUserItems } from '../../redux/slices/userItemsSlice.js';
import { useSelector, useDispatch } from 'react-redux';
import { Riple } from 'react-loading-indicators';
import { apiFetch, getAuthToken, getApiUrl } from '../../services/api.js';

const PokemonSelection = lazy(() => import('../PokemonSelection/index.jsx'));
const ModeSelection = lazy(() => import('../ModeSelection/modeSelection.jsx'));
const MatchVsIa = lazy(() => import('../IaMatch/IaMatch.jsx'));
const Bag = lazy(() => import('../Bag/bag.jsx'));
const Store = lazy(() => import('../Store/store.jsx'));

export default memo(function Index({ setToken }) {
  const [showSideNav, setShowSideNav] = useState(window.innerWidth > 1200);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [battleRequest, setBattleRequest] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const socket = useRef(null);
  const token = getAuthToken();
  const [showChat, setShowChat] = useState(false);
  const [globalRoom, setGlobalRoom] = useState();
  const [roomUsers, setRoomUsers] = useState([]);
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const { actualSection, userState } = useSelector(selectUserInterfaceData);

  const indexElementStyle = {
    paddingRight: !showSideNav || userState === 'In explore match' ? '0px' : null,
    paddingTop: userState === 'In explore match' || userState === 'In normal match' ? '0px' : null,
  };

  useEffect(() => {
    dispatch(getUserPokemon(token));
    dispatch(getUserItems(token));

    if (!user.id) {
      apiFetch('pokemons/users/getUserData', {
        method: 'POST',
        body: JSON.stringify({ token }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.message !== 'Usuario no encontrado') {
            dispatch(setUser(data));
          } else {
            setToken(null);
          }
        })
        .catch(() => {});
    }
  }, [dispatch, token, user.id, setToken]);

  useEffect(() => {
    socket.current = io(getApiUrl(), { auth: { token } });
    return () => {
      socket.current?.disconnect();
    };
  }, [token]);

  useEffect(() => {
    if (user.id && socket.current) {
      socket.current.emit('authenticate', { userName: user.userName });
    }
    return () => socket.current?.off('authenticate');
  }, [user.id, user.userName]);

  useEffect(() => {
    if (!socket.current) return;

    socket.current.on('battle-mailbox', (msg) => {
      const request = [{ roomId: msg.roomId, from: msg.from, to: msg.from }];
      setBattleRequest(request);
      setTimeout(() => setBattleRequest([]), 7000);
    });

    return () => socket.current?.off('battle-mailbox');
  }, []);

  useEffect(() => {
    if (!socket.current) return;

    socket.current.on('user-list', (msg) => {
      const filtered = msg.filter((u) => u.userName !== user.userName);
      const friendFolders = [
        {
          name: 'general',
          users: filtered,
        },
      ];
      setConnectedUsers(friendFolders);
    });

    return () => socket.current?.off('user-list');
  }, [user.userName]);

  useEffect(() => {
    if (!socket.current) return;

    socket.current.on('chat-message', (msg) => {
      dispatch(setUserMessages(msg));
    });

    return () => socket.current?.off('chat-message');
  }, [dispatch]);

  useEffect(() => {
    if (!socket.current) return;

    socket.current.on('start-match', () => {
      dispatch(setUserState('In normal match'));
      dispatch(setActualSection('PokemonSelection'));
    });

    return () => socket.current?.off('start-match');
  }, [dispatch]);

  const handleEmitChatMessage = useCallback(
    ({ e, chatInput }) => {
      e.preventDefault();
      socket.current?.emit('chat-message', {
        to: selectedUser,
        from: user.userName,
        message: chatInput,
      });
    },
    [selectedUser, user.userName]
  );

  const handleEmitBattleRequest = useCallback(() => {
    socket.current?.emit('battle-request', {
      to: selectedUser,
      from: user.userName,
      roomId: localStorage.getItem('roomId'),
    });
  }, [selectedUser, user.userName]);

  useEffect(() => {
    if (userState === 'In explore match' || userState === 'In normal match') {
      setShowSideNav(false);
    } else if (!showSideNav && window.innerWidth > 1200) {
      setShowSideNav(true);
    }
  }, [userState, showSideNav]);

  return user.id ? (
    <div style={indexElementStyle} className="index">
      <Header globalRoom={globalRoom} showSideNav={showSideNav} setShowSideNav={setShowSideNav} />

      <RightNav
        socket={socket}
        setToken={setToken}
        showSideNav={showSideNav}
        setShowSideNav={setShowSideNav}
        showChat={showChat}
        connectedUsers={connectedUsers}
        setShowChat={setShowChat}
        setSelectedUser={setSelectedUser}
        handleEmitBattleRequest={handleEmitBattleRequest}
        battleRequest={battleRequest}
        selectedUser={selectedUser}
      />

      <Chat
        showChat={showChat}
        selectedUser={selectedUser}
        connectedUsers={connectedUsers}
        chatMessages={user.messages}
        handleEmitChatMessage={handleEmitChatMessage}
      />

      {actualSection === 'Home' && <section className="inicio"></section>}
      {actualSection === 'Bag' && (
        <Suspense fallback={<div className="loading"><Riple color="var(--gold-one)" size="medium" text="" textColor="" /></div>}>
          <Bag />
        </Suspense>
      )}
      {actualSection === 'Store' && (
        <Suspense fallback={<div className="loading"><Riple color="var(--gold-one)" size="medium" text="" textColor="" /></div>}>
          <Store />
        </Suspense>
      )}
      {actualSection === 'ModeSelection' && (
        <Suspense fallback={<div className="loading"><Riple color="var(--gold-one)" size="medium" text="" textColor="" /></div>}>
          <ModeSelection
            socket={socket}
            setGlobalRoom={setGlobalRoom}
            globalRoom={globalRoom}
            roomUsers={roomUsers}
            setRoomUsers={setRoomUsers}
          />
        </Suspense>
      )}
      {actualSection === 'PokemonSelection' && (
        <Suspense fallback={<div className="loading"><Riple color="var(--gold-one)" size="medium" text="" textColor="" /></div>}>
          <PokemonSelection roomId={localStorage.getItem('roomId')} socket={socket} />
        </Suspense>
      )}
      {actualSection === 'IaMatch' && (
        <Suspense fallback={<div className="loading"><Riple color="var(--gold-one)" size="medium" text="" textColor="" /></div>}>
          <MatchVsIa socket={socket} />
        </Suspense>
      )}
    </div>
  ) : (
    <div className="loadingScreen">
      <div className="wrapper">
        <div className="pokeball"></div>
      </div>
    </div>
  );
});
import { useState, useEffect, memo } from 'react';
import './chat.css';

export default memo(function Chat({
  showChat,
  selectedUser,
  chatMessages,
  handleEmitChatMessage,
  connectedUsers,
}) {
  const [chatInput, setChatInput] = useState('');
  const userSelectedInfo = connectedUsers[0]?.users?.find((u) => u.userName === selectedUser);

  useEffect(() => {
    if (showChat) {
      const openChat = new Audio(
        'https://github.com/jonylazarte/resources/raw/refs/heads/main/general/menu-click.mp3'
      );
      openChat.play().catch(() => {});
    }
  }, [showChat]);

  return (
    <>
      {showChat && (
        <div className="chat">
          <div style={{ paddingLeft: !selectedUser ? '20px' : null }} className="chatHead">
            {selectedUser && (
              <div style={{ marginRight: '10px' }} className="icon-border mini">
                <img
                  className="user-icon mini"
                  src={`https://raw.githubusercontent.com/jonylazarte/resources/refs/heads/main/profileicon/${userSelectedInfo?.profileIcon}.png`}
                  alt=""
                />
                <div className="box-status-icon" />
              </div>
            )}
            {selectedUser ? selectedUser : 'Selecciona un chat'}
          </div>
          <div className="chat-messages">
            {chatMessages &&
              chatMessages.map(
                (cm, idx) =>
                  (cm.from === selectedUser && (
                    <span key={idx} style={{ textAlign: 'left' }}>
                      {cm.message}
                    </span>
                  )) ||
                  (cm.to === selectedUser && (
                    <span key={idx} style={{ textAlign: 'right' }}>
                      {cm.message}
                    </span>
                  ))
              )}
          </div>
          <form
            onSubmit={(e) => {
              handleEmitChatMessage({ e, chatInput });
              setChatInput('');
            }}
            className="chat-form"
          >
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="input-chat"
              placeholder="Escribe aquí..."
            />
          </form>
        </div>
      )}
    </>
  );
});
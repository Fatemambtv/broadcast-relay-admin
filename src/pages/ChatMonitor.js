import React, { useEffect, useState } from 'react';
import { ref, onValue, remove, update } from 'firebase/database';
import { Realtimedb } from '../util/firebase';
import { RiDeleteBinLine, RiEyeOffLine, RiStarLine, RiStarFill } from 'react-icons/ri';
import '../styles/index.css';

const SERVER_KEYS = ['A', 'B', 'C'];

const ChatMonitor = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  // Fetch all messages from all servers
  useEffect(() => {
    setLoading(true);
    const listeners = [];
    let allChats = [];

    const handleSnapshot = (server) => (snapshot) => {
      const data = snapshot.val() || {};
      // Remove previous messages from this server
      allChats = allChats.filter(chat => chat.server !== server);
      // Add new messages
      Object.entries(data).forEach(([msgId, msg]) => {
        if (msg && typeof msg === 'object') {
          allChats.push({
            id: msgId,
            server,
            ...msg,
          });
        }
      });
      // Sort by timestamp descending
      const sorted = [...allChats].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      setChats(sorted);
      setLoading(false);
    };

    SERVER_KEYS.forEach(server => {
      const messagesRef = ref(Realtimedb, `servers/${server}/messages`);
      const unsubscribe = onValue(messagesRef, handleSnapshot(server));
      listeners.push(unsubscribe);
    });

    return () => {
      listeners.forEach(unsub => unsub());
    };
  }, []);

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 2000);
  };

  // Delete chat
  const handleDelete = async (server, msgId) => {
    if (!window.confirm('Delete this chat?')) return;
    try {
      await remove(ref(Realtimedb, `servers/${server}/messages/${msgId}`));
      showNotification('Chat deleted');
    } catch (err) {
      showNotification('Delete failed: ' + err.message, 'error');
    }
  };

  // Hide chat
  const handleHide = async (server, msgId) => {
    try {
      await update(ref(Realtimedb, `servers/${server}/messages/${msgId}`), { hidden: true });
      showNotification('Chat hidden');
    } catch (err) {
      showNotification('Hide failed: ' + err.message, 'error');
    }
  };

  // Toggle important
  const handleToggleImportant = async (server, msgId, current) => {
    try {
      await update(ref(Realtimedb, `servers/${server}/messages/${msgId}`), { important: !current });
      showNotification(!current ? 'Marked as important' : 'Unmarked as important');
    } catch (err) {
      showNotification('Update failed: ' + err.message, 'error');
    }
  };

  return (
    <div className="card">
      {notification && (
        <div
          className={`popup-message ${notification.type === 'error' ? 'popup-error' : 'popup-success'}`}
          style={{
            position: 'fixed',
            top: 24,
            right: 24,
            zIndex: 9999,
            minWidth: 220,
            background: notification.type === 'error' ? '#ffebee' : '#e8f5e9',
            color: notification.type === 'error' ? '#c62828' : '#2e7d32',
            border: `1px solid ${notification.type === 'error' ? '#c62828' : '#2e7d32'}`,
            borderRadius: 8,
            padding: '14px 24px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
            fontWeight: 500,
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            animation: 'fadeIn 0.2s'
          }}
          role="alert"
          aria-live="assertive"
        >
          <span style={{ flex: 1 }}>{notification.msg}</span>
          <button
            onClick={() => setNotification(null)}
            style={{
              background: 'none',
              border: 'none',
              color: 'inherit',
              fontSize: 18,
              cursor: 'pointer',
              marginLeft: 8,
              lineHeight: 1
            }}
            aria-label="Close notification"
            tabIndex={0}
          >
            ×
          </button>
        </div>
      )}
      <h1 className="title">Chat Monitor</h1>
      {loading ? (
        <div className="text-center" aria-live="polite">
          <div className="spinner spinner-medium spinner-primary" />
          <p className="mt-2">Loading chats...</p>
        </div>
      ) : (
        <div>
          {chats.length === 0 ? (
            <p className="text-center">No chats found.</p>
          ) : (
            <div className="user-list">
              {chats.map(chat => (
                <div
                  key={chat.server + '-' + chat.id}
                  className="user-row"
                  style={{
                    opacity: chat.hidden ? 0.5 : 1,
                    background: chat.important ? '#fffde7' : undefined,
                    borderLeft: chat.important ? '4px solid #ffd600' : undefined,
                  }}
                >
                  <div className="user-info" style={{ flex: 2 }}>
                    <span style={{ fontWeight: 600 }}>{chat.user || chat.username || 'Unknown'}</span>
                    <span className="user-id" style={{ fontSize: 12 }}>
                      Server: {chat.server} | ID: {chat.id}
                    </span>
                    <span style={{ marginLeft: 12, color: '#555' }}>{chat.message || chat.text}</span>
                  </div>
                  <div className="row-actions">
                    <button
                      className="flat-button"
                      title={chat.important ? "Unmark important" : "Mark as important"}
                      aria-label={chat.important ? "Unmark important" : "Mark as important"}
                      onClick={() => handleToggleImportant(chat.server, chat.id, !!chat.important)}
                    >
                      {chat.important ? <RiStarFill color="#ffd600" /> : <RiStarLine />}
                    </button>
                    <button
                      className="flat-button"
                      title="Hide chat"
                      aria-label="Hide chat"
                      onClick={() => handleHide(chat.server, chat.id)}
                      disabled={!!chat.hidden}
                    >
                      <RiEyeOffLine />
                    </button>
                    <button
                      className="flat-button danger-icon"
                      title="Delete chat"
                      aria-label="Delete chat"
                      onClick={() => handleDelete(chat.server, chat.id)}
                    >
                      <RiDeleteBinLine />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatMonitor;

import React, { useEffect, useState } from 'react';
import { ref, onValue, remove, update } from 'firebase/database';
import { Realtimedb } from '../util/firebase';
import { RiDeleteBinLine, RiEyeOffLine, RiEyeLine, RiStarLine, RiStarFill } from 'react-icons/ri';
import '../styles/index.css';
import '../styles/chat-status-badges.css';

// Custom Confirmation Dialog Component
const ConfirmationDialog = ({ isOpen, message, onConfirm, onCancel }) => {
  // Handle keyboard events (Enter to confirm, Escape to cancel)
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onConfirm();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };
  
  // Add event listener when the dialog opens and remove it when it closes
  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onConfirm, onCancel]);
  
  if (!isOpen) return null;
  
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>Confirm Delete</h2>
        <p>{message}</p>
        <div className="modal-buttons">
          <button 
            className="button button-danger" 
            onClick={onConfirm} 
            autoFocus
          >
            Delete
          </button>
          <button 
            className="button" 
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

const SERVER_KEYS = ['A', 'B', 'C'];

const ChatMonitor = () => {
  const [chats, setChats] = useState([]);
  const [chatsByServer, setChatsByServer] = useState({});
  const [activeServer, setActiveServer] = useState('all');
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);  
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    message: '',
    server: null,
    msgId: null,
    deleteAll: false
  });

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
      
      // Group by server and sort each group by timestamp
      const serverGroups = {};
      SERVER_KEYS.forEach(server => {
        const serverChats = allChats.filter(chat => chat.server === server);
        serverGroups[server] = [...serverChats].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      });
      
      setChatsByServer(serverGroups);
      
      // Sort all chats by timestamp descending (for "All" tab)
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
  };  // Delete chat
  const handleDelete = (server, msgId) => {
    // Find the chat message to display in the confirmation dialog
    const chatToDelete = chats.find(chat => chat.server === server && chat.id === msgId);
    const userName = chatToDelete?.user || chatToDelete?.username || 'Unknown user';
    const message = chatToDelete?.message || chatToDelete?.text || '';
    
    setConfirmDialog({
      isOpen: true,
      message: `Are you sure you want to delete this message from ${userName}?\n\n"${message.length > 80 ? message.substring(0, 80) + '...' : message}"`,
      server,
      msgId
    });
  };
  // Handle delete all chats for a server
  const handleDeleteAll = (server) => {
    const chatCount = (chatsByServer[server] || []).length;
    
    if (chatCount === 0) {
      showNotification('No chats to delete', 'error');
      return;
    }
    
    setConfirmDialog({
      isOpen: true,
      message: `Are you sure you want to delete ALL ${chatCount} chat messages from Server ${server}?\n\nThis action cannot be undone.`,
      server,
      msgId: null,
      deleteAll: true
    });
  };
  // Confirm chat deletion
  const confirmDelete = async () => {
    const { server, msgId, deleteAll } = confirmDialog;
    try {
      if (deleteAll) {
        // Delete all chats for a specific server
        await remove(ref(Realtimedb, `servers/${server}/messages`));
        // No notification for successful deletion
      } else {
        // Delete single chat
        await remove(ref(Realtimedb, `servers/${server}/messages/${msgId}`));
        // No notification for successful deletion
      }
    } catch (err) {
      // Still show notification for errors
      showNotification('Delete failed: ' + err.message, 'error');
    } finally {
      // Close the dialog
      setConfirmDialog({ isOpen: false, message: '', server: null, msgId: null, deleteAll: false });
    }
  };
  // Toggle hide/unhide chat
  const handleToggleVisibility = async (server, msgId, isCurrentlyHidden) => {
    try {
      await update(ref(Realtimedb, `servers/${server}/messages/${msgId}`), { hidden: !isCurrentlyHidden });
      showNotification(isCurrentlyHidden ? 'Chat unhidden' : 'Chat hidden');
    } catch (err) {
      showNotification('Update failed: ' + err.message, 'error');
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

  // Function to render chat items
  const renderChatItems = (chatList) => {
    if (!chatList || chatList.length === 0) {
      return <p className="text-center">No chats found.</p>;
    }
    
    return (
      <div className="user-list">
        {chatList.map(chat => (          <div
            key={chat.server + '-' + chat.id}
            className={`user-row ${chat.hidden ? 'hidden-chat' : ''}`}
            style={{
              opacity: chat.hidden ? 0.7 : 1,
              background: chat.important ? '#fffde7' : undefined,
              borderLeft: chat.important ? '4px solid #ffd600' : undefined,
            }}
          >
            <div className="user-info" style={{ flex: 2 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 600 }}>{chat.user || chat.username || 'Unknown'}</span>
                {chat.hidden && (
                  <span className="status-badge hidden-badge" title="This message is hidden from clients">
                    <RiEyeOffLine size={12} style={{ marginRight: '4px' }} />
                    Hidden
                  </span>
                )}
                {chat.important && (
                  <span className="status-badge important-badge" title="This message is marked as important">
                    <RiStarFill size={12} style={{ marginRight: '4px' }} />
                    Important
                  </span>
                )}
              </div>
              <span className="user-id" style={{ fontSize: 12 }}>
                Server: <span className="server-badge">{chat.server}</span> | ID: {chat.id}
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
              </button>              <button
                className="flat-button"
                title={chat.hidden ? "Unhide chat" : "Hide chat"}
                aria-label={chat.hidden ? "Unhide chat" : "Hide chat"}
                onClick={() => handleToggleVisibility(chat.server, chat.id, !!chat.hidden)}
              >
                {chat.hidden ? <RiEyeLine /> : <RiEyeOffLine />}
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
    );
  };

  // Get current chats based on active server
  const getCurrentChats = () => {
    if (activeServer === 'all') {
      return chats;
    }
    return chatsByServer[activeServer] || [];
  };
  return (
    <div className="card">
      {/* Confirmation Dialog */}      <ConfirmationDialog 
        isOpen={confirmDialog.isOpen}
        message={confirmDialog.message}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDialog({ isOpen: false, message: '', server: null, msgId: null, deleteAll: false })}
      />
      
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
        <div>          <div className="server-section">
            <div className="server-tabs">
              <button 
                className={`server-tab ${activeServer === 'all' ? 'active' : ''}`}
                onClick={() => setActiveServer('all')}
              >
                All Servers
                <span className="chat-count">{chats.length}</span>
              </button>
              
              {SERVER_KEYS.map(server => (
                <button
                  key={server}
                  className={`server-tab ${activeServer === server ? 'active' : ''}`}
                  onClick={() => setActiveServer(server)}
                >
                  Server {server}
                  <span className="chat-count">{(chatsByServer[server] || []).length}</span>
                </button>
              ))}
            </div>            <div className="server-actions">
              {activeServer !== 'all' ? (
                <button 
                  className="button button-danger delete-all-btn"
                  onClick={() => handleDeleteAll(activeServer)}
                  disabled={(chatsByServer[activeServer] || []).length === 0}
                  title={`Delete all chats from Server ${activeServer}`}
                >
                  <RiDeleteBinLine /> Delete All Chats from Server {activeServer}
                </button>
              ) : null}
            </div>
          </div>
            <div className="server-content" tabIndex="0">
            {renderChatItems(getCurrentChats())}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatMonitor;

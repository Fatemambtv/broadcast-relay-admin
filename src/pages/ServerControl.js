import React, { useState, useEffect } from 'react';
import ServerControlCard from '../components/ServerControlCard';
import SystemControlCard from '../components/SystemControlCard';
import useServerControls from '../hooks/useServerControls';

const ServerControl = () => {
  const { 
    servers, 
    loginStatus, 
    eventName, 
    message, 
    updateServer, 
    updateLoginStatus, 
    updateEventName,
    handleEventNameChange,
    handleServerIDChange
  } = useServerControls();

  const [notification, setNotification] = useState(null);

  // Listen for message changes and show popup
  useEffect(() => {
    if (message) {
      setNotification({ msg: message, type: 'success' });
      const timer = setTimeout(() => setNotification(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div className="card">
      {/* Notification Popup */}
      {notification && (
        <div
          className={`popup-message popup-success`}
          style={{
            position: 'fixed',
            top: 24,
            right: 24,
            zIndex: 9999,
            minWidth: 220,
            background: '#e8f5e9',
            color: '#2e7d32',
            border: '1px solid #2e7d32',
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
      <h1 className="title">Server Control Panel</h1>
      <div className="server-grid">
        <SystemControlCard 
          className="stat-card system-card"
          loginStatus={loginStatus}
          eventName={eventName}
          onUpdateLoginStatus={updateLoginStatus}
          onUpdateEventName={updateEventName}
          handleEventNameChange={handleEventNameChange}
        />
        {Object.entries(servers).map(([server, data]) => (
          <ServerControlCard
            className="stat-card"
            key={server}
            server={server}
            serverData={data}
            onUpdateId={(value) => updateServer(server, 'ID', value)}
            onUpdateStatus={(value) => updateServer(server, 'Status', value)}
            handleServerIDChange={(value) => handleServerIDChange(server, value)}
          />
        ))}
      </div>
    </div>
  );
};

export default ServerControl;
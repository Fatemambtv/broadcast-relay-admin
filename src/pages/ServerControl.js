import React from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import ServerControlCard from '../components/ServerControlCard';
import SystemControlCard from '../components/SystemControlCard';
import useServerControls from '../hooks/useServerControls';
import '../styles/ServerControl.css';

const ServerControl = () => {
  const { 
    servers, 
    loginStatus, 
    eventName, 
    message, 
    updateServer, 
    updateLoginStatus, 
    updateEventName 
  } = useServerControls();

  return (
    <div className="server-control-container">
      {message && <div className="message-container show">{message}</div>}
      
      <h1 className="page-title">Server Control Panel</h1>
      
      <div className="server-grid">
        <SystemControlCard 
          loginStatus={loginStatus}
          eventName={eventName}
          onUpdateLoginStatus={updateLoginStatus}
          onUpdateEventName={updateEventName}
        />
        
        {Object.entries(servers).map(([server, data]) => (
          <ServerControlCard
            key={server}
            server={server}
            serverData={data}
            onUpdateId={(value) => updateServer(server, 'ID', value)}
            onUpdateStatus={(value) => updateServer(server, 'Status', value)}
          />
        ))}
      </div>
    </div>
  );
};

export default ServerControl;
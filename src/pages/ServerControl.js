import React from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
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
    updateEventName 
  } = useServerControls();

  return (
    <div className="card">
      <h1 className="title">Server Control Panel</h1>
      
      {message && <div className="success-message" aria-live="polite">{message}</div>}
      
      {/* <div className="section"> */}
        <div className="server-grid">
          <SystemControlCard 
            className="stat-card system-card"
            loginStatus={loginStatus}
            eventName={eventName}
            onUpdateLoginStatus={updateLoginStatus}
            onUpdateEventName={updateEventName}
          />
          
          {Object.entries(servers).map(([server, data]) => (
            <ServerControlCard
              className="stat-card"
              key={server}
              server={server}
              serverData={data}
              onUpdateId={(value) => updateServer(server, 'ID', value)}
              onUpdateStatus={(value) => updateServer(server, 'Status', value)}
            />
          ))}
        </div>
      {/* </div> */}
    </div>
  );
};

export default ServerControl;
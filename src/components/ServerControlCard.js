import React from 'react';

const ServerControlCard = ({ 
  server, 
  serverData, 
  onUpdateId, 
  onUpdateStatus, 
  className = '' 
}) => {
  const { id, status } = serverData;
  
  return (
    <div className={`server-card ${className}`}>
      <h2>Server {server}</h2>
      <div className="control-group">
        <label htmlFor={`server${server}ID`} className="toggle-label">
          <span>Server ID:</span>
        </label>
        <div className="input-group">
          <input
            type="text"
            id={`server${server}ID`}
            value={id}
            onChange={(e) => {}}
            placeholder={`Enter Server ${server} ID`}
          />
          <button 
            className="btn-primary" 
            onClick={() => onUpdateId(document.getElementById(`server${server}ID`).value)}
          >
            Update
          </button>
        </div>
      </div>
      <div className="control-group">
        <label htmlFor={`serverStatus${server}`} className="toggle-label">
          <span>
            <span className={`status-indicator ${status ? 'status-online' : 'status-offline'}`}></span>
            Server Status: {status ? 'Online' : 'Offline'}
          </span>
          <label className="toggle-switch">
            <input
              type="checkbox"
              id={`serverStatus${server}`}
              checked={status}
              onChange={() => onUpdateStatus(!status)}
            />
            <span className="toggle-slider"></span>
          </label>
        </label>
      </div>
    </div>
  );
};

export default ServerControlCard;
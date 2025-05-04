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
    <div className={`stat-card ${className}`}>
      <h2 className="subtitle">Server {server}</h2>
      <div className="form-group">
        <div className="form-field">
          <label htmlFor={`server${server}ID`} className="form-label">
            Server ID
          </label>
          <input
            type="text"
            id={`server${server}ID`}
            className="input"
            value={id}
            onChange={(e) => onUpdateId(e.target.value)}
            placeholder={`Enter Server ${server} ID`}
            aria-label={`Server ID for ${server}`}
          />
        </div>
        <div className="form-field">
          <div className="status-row">
            <label htmlFor={`serverStatus${server}`} className="form-label">
              Server Status: {status ? 'Online' : 'Offline'}
            </label>
            <div className="status-group">
              <span
                className="status-dot"
                style={{
                  backgroundColor: status ? 'var(--primary-color)' : 'var(--danger)',
                }}
                title={status ? 'Online' : 'Offline'}
                aria-label={`Server ${server} status: ${status ? 'Online' : 'Offline'}`}
              />
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  id={`serverStatus${server}`}
                  checked={status}
                  onChange={() => onUpdateStatus(!status)}
                  aria-label={`Toggle status for ${server}`}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>
        <button 
          className="button button-primary form-button" 
          onClick={() => onUpdateId(id)}
          aria-label={`Update Server ${server} ID`}
        >
          Update
        </button>
      </div>
    </div>
  );
};

export default ServerControlCard;
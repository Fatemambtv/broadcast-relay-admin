import React, { useState } from 'react';

const ServerControlCard = ({ 
  server, 
  serverData, 
  onUpdateId, 
  onUpdateStatus, 
  handleServerIDChange,
  className = '' 
}) => {
  const { id, status } = serverData;
  const [popup, setPopup] = useState('');

  const showPopup = (msg) => {
    setPopup(msg);
    setTimeout(() => setPopup(''), 2500);
  };

  return (
    <div className={`stat-card ${className}`}>
      {/* Popup message */}
      {popup && (
        <div className="popup-message" style={{
          background: '#fff3cd',
          color: '#856404',
          border: '1px solid #ffeeba',
          borderRadius: '4px',
          padding: '8px 16px',
          marginBottom: '12px',
          textAlign: 'center',
          fontSize: '0.95em',
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          <span style={{ flex: 1 }}>{popup}</span>
          <button
            onClick={() => setPopup('')}
            style={{
              background: 'none',
              border: 'none',
              color: 'inherit',
              fontSize: 18,
              cursor: 'pointer',
              marginLeft: 8,
              lineHeight: 1
            }}
            aria-label="Close popup"
            tabIndex={0}
          >
            ×
          </button>
        </div>
      )}
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
            onChange={(e) => handleServerIDChange(e.target.value)}
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
                  onChange={() => {
                    // Only allow setting online if id is not empty
                    if (!status && !id) {
                      showPopup("Please enter a Server ID before enabling the server.");
                      return;
                    }
                    onUpdateStatus(!status);
                  }}
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
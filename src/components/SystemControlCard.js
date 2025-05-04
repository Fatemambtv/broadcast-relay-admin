import React from 'react';

const SystemControlCard = ({ 
  loginStatus, 
  eventName, 
  onUpdateLoginStatus, 
  onUpdateEventName,
  className = ''
}) => {
  return (
    <div className={`stat-card ${className}`}>
      <h2 className="subtitle">System Controls</h2>
      <div className="form-group">
        <div className="form-field">
          <div className="status-row">
            <label htmlFor="loginStatus" className="form-label">
              Login Status: {loginStatus ? 'Enabled' : 'Disabled'}
            </label>
            <div className="status-group">
              <span
                className="status-dot"
                style={{
                  backgroundColor: loginStatus ? 'var(--primary-color)' : 'var(--danger)',
                }}
                title={loginStatus ? 'Enabled' : 'Disabled'}
                aria-label={`Login status: ${loginStatus ? 'Enabled' : 'Disabled'}`}
              />
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  id="loginStatus"
                  checked={loginStatus}
                  onChange={() => onUpdateLoginStatus(!loginStatus)}
                  aria-label="Toggle login status"
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>
        <div className="form-field">
          <label htmlFor="eventName" className="form-label">
            Event Name
          </label>
          <input
            type="text"
            id="eventName"
            className="input"
            value={eventName}
            onChange={(e) => onUpdateEventName(e.target.value)}
            placeholder="Enter Event Name"
            aria-label="Event name"
          />
        </div>
        <button 
          className="button button-primary form-button" 
          onClick={() => onUpdateEventName(eventName)}
          aria-label="Update event name"
        >
          Update
        </button>
      </div>
    </div>
  );
};

export default SystemControlCard;
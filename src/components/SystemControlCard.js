import React from 'react';

const SystemControlCard = ({ 
  loginStatus, 
  eventName, 
  onUpdateLoginStatus, 
  onUpdateEventName 
}) => {
  return (
    <div className="server-card system-card">
      <h2>System Controls</h2>
      <div className="control-group">
        <label htmlFor="loginStatus" className="toggle-label">
          <span>
            <span className={`status-indicator ${loginStatus ? 'status-online' : 'status-offline'}`}></span>
            Login Status: {loginStatus ? 'Enabled' : 'Disabled'}
          </span>
          <label className="toggle-switch">
            <input
              type="checkbox"
              id="loginStatus"
              checked={loginStatus}
              onChange={() => onUpdateLoginStatus(!loginStatus)}
            />
            <span className="toggle-slider"></span>
          </label>
        </label>
      </div>
      <div className="control-group">
        <label htmlFor="eventName" className="toggle-label">
          <span>Event Name:</span>
        </label>
        <div className="input-group">
          <input
            type="text"
            id="eventName"
            value={eventName}
            onChange={(e) => {}}
            placeholder="Enter Event Name"
          />
          <button 
            className="btn-primary" 
            onClick={() => onUpdateEventName(document.getElementById('eventName').value)}
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
};

export default SystemControlCard;
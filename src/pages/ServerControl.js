import React, { useState, useEffect } from 'react';
import { ref, onValue, set } from "firebase/database";
import { Realtimedb } from "../util/firebase";
import LoadingSpinner from '../components/LoadingSpinner';
import './ServerControl.css';

const ServerControl = () => {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [eventName, setEventName] = useState('');
  
  const [serverAID, setServerAID] = useState('');
  const [serverAStatus, setServerAStatus] = useState(false);
  
  const [serverBID, setServerBID] = useState('');
  const [serverBStatus, setServerBStatus] = useState(false);
  
  const [serverCID, setServerCID] = useState('');
  const [serverCStatus, setServerCStatus] = useState(false);
  
  const [serverDID, setServerDID] = useState('');
  const [serverDStatus, setServerDStatus] = useState(false);
  
  const [loginStatus, setLoginStatus] = useState(false);

  useEffect(() => {
    setLoading(true);

    // Listen to loginStatus
    const loginStatusRef = ref(Realtimedb, 'loginStatus');
    onValue(loginStatusRef, (snapshot) => {
      const data = snapshot.val() || false;
      setLoginStatus(data);
      document.getElementById('loginStatus').checked = data;
    });

    // Listen to event name (miqaatName)
    const eventNameRef = ref(Realtimedb, 'miqaatName');
    onValue(eventNameRef, (snapshot) => {
      const data = snapshot.val() || '';
      setEventName(data);
      document.getElementById('eventName').value = data;
    });

    // Listen to server A data
    const serverAIDRef = ref(Realtimedb, 'serverAID');
    onValue(serverAIDRef, (snapshot) => {
      const data = snapshot.val() || '';
      setServerAID(data);
      document.getElementById('serverAID').value = data;
    });

    const serverAStatusRef = ref(Realtimedb, 'serverAStatus');
    onValue(serverAStatusRef, (snapshot) => {
      const data = snapshot.val() || false;
      setServerAStatus(data);
      document.getElementById('serverStatusA').checked = data;
    });

    // Listen to server B data
    const serverBIDRef = ref(Realtimedb, 'serverBID');
    onValue(serverBIDRef, (snapshot) => {
      const data = snapshot.val() || '';
      setServerBID(data);
      document.getElementById('serverBID').value = data;
    });

    const serverBStatusRef = ref(Realtimedb, 'serverBStatus');
    onValue(serverBStatusRef, (snapshot) => {
      const data = snapshot.val() || false;
      setServerBStatus(data);
      document.getElementById('serverStatusB').checked = data;
    });

    // Listen to server C data
    const serverCIDRef = ref(Realtimedb, 'serverCID');
    onValue(serverCIDRef, (snapshot) => {
      const data = snapshot.val() || '';
      setServerCID(data);
      document.getElementById('serverCID').value = data;
    });

    const serverCStatusRef = ref(Realtimedb, 'serverCStatus');
    onValue(serverCStatusRef, (snapshot) => {
      const data = snapshot.val() || false;
      setServerCStatus(data);
      document.getElementById('serverStatusC').checked = data;
    });

    // Listen to server D data
    const serverDIDRef = ref(Realtimedb, 'serverDID');
    onValue(serverDIDRef, (snapshot) => {
      const data = snapshot.val() || '';
      setServerDID(data);
      document.getElementById('serverDID').value = data;
    });

    const serverDStatusRef = ref(Realtimedb, 'serverDStatus');
    onValue(serverDStatusRef, (snapshot) => {
      const data = snapshot.val() || false;
      setServerDStatus(data);
      document.getElementById('serverStatusD').checked = data;
    });

    setLoading(false);
  }, []);

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => {
      setMessage('');
    }, 2000); // Match AdminControls timeout
  };

  const updateLoginStatus = () => {
    const newLoginStatus = document.getElementById("loginStatus").checked;
    setLoginStatus(newLoginStatus);
    set(ref(Realtimedb, "loginStatus"), newLoginStatus);
    showMessage(`Login ${newLoginStatus ? 'enabled' : 'disabled'} successfully!`);
  };

  const updateEventName = () => {
    const eventNameInput = document.getElementById('eventName').value;
    if (eventNameInput === '') {
      showMessage("Event Name cannot be empty");
      return;
    }
    set(ref(Realtimedb, 'miqaatName'), eventNameInput);
    setEventName(eventNameInput);
    showMessage("Event Name Updated");
  };

  const updateServerAID = () => {
    const newServerAID = document.getElementById("serverAID").value;
    setServerAID(newServerAID);
    set(ref(Realtimedb, "serverAID"), newServerAID);
    showMessage("Server A ID Updated");
  };

  const updateServerAStatus = () => {
    const newServerAStatus = document.getElementById("serverStatusA").checked;
    setServerAStatus(newServerAStatus);
    set(ref(Realtimedb, "serverAStatus"), newServerAStatus);
    showMessage(`Server A ${newServerAStatus ? 'activated' : 'deactivated'} successfully!`);
  };

  const updateServerBID = () => {
    const newServerBID = document.getElementById("serverBID").value;
    setServerBID(newServerBID);
    set(ref(Realtimedb, "serverBID"), newServerBID);
    showMessage("Server B ID Updated");
  };

  const updateServerBStatus = () => {
    const newServerBStatus = document.getElementById("serverStatusB").checked;
    setServerBStatus(newServerBStatus);
    set(ref(Realtimedb, "serverBStatus"), newServerBStatus);
    showMessage(`Server B ${newServerBStatus ? 'activated' : 'deactivated'} successfully!`);
  };

  const updateServerCID = () => {
    const newServerCID = document.getElementById("serverCID").value;
    setServerCID(newServerCID);
    set(ref(Realtimedb, "serverCID"), newServerCID);
    showMessage("Server C ID Updated");
  };

  const updateServerCStatus = () => {
    const newServerCStatus = document.getElementById("serverStatusC").checked;
    setServerCStatus(newServerCStatus);
    set(ref(Realtimedb, "serverCStatus"), newServerCStatus);
    showMessage(`Server C ${newServerCStatus ? 'activated' : 'deactivated'} successfully!`);
  };

  const updateServerDID = () => {
    const newServerDID = document.getElementById("serverDID").value;
    setServerDID(newServerDID);
    set(ref(Realtimedb, "serverDID"), newServerDID);
    showMessage("Server D ID Updated");
  };

  const updateServerDStatus = () => {
    const newServerDStatus = document.getElementById("serverStatusD").checked;
    setServerDStatus(newServerDStatus);
    set(ref(Realtimedb, "serverDStatus"), newServerDStatus);
    showMessage(`Server D ${newServerDStatus ? 'activated' : 'deactivated'} successfully!`);
  };

  if (loading) {
    return <LoadingSpinner size="large" text="Loading server data..." />;
  }

  return (
    <div className="server-control-container">
      <h1 className="page-title">Server Control</h1>
      
      {message && <div className="message-container show">{message}</div>}
      
      <div className="server-grid">
        <div className="server-card system-card">
          <h2>System Controls</h2>
          <div className="control-group">
            <label htmlFor="loginStatus" className="toggle-label">
              <span className={`status-indicator ${loginStatus ? 'status-online' : 'status-offline'}`}></span>
              Login Status
              <div className="toggle-switch">
                <input
                  id="loginStatus"
                  type="checkbox"
                  checked={loginStatus}
                  onChange={updateLoginStatus}
                />
                <span className="toggle-slider"></span>
              </div>
            </label>

            <div className="input-group">
              <input
                type="text"
                placeholder="Event Name"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                id="eventName"
              />
              <button className="btn-primary" onClick={updateEventName}>Update</button>
            </div>
          </div>
        </div>
        
        <div className="server-card">
          <h2>Server A</h2>
          <div className="control-group">
            <label htmlFor="serverStatusA" className="toggle-label">
              <span className={`status-indicator ${serverAStatus ? 'status-online' : 'status-offline'}`}></span>
              Server Status
              <div className="toggle-switch">
                <input
                  id="serverStatusA"
                  type="checkbox"
                  checked={serverAStatus}
                  onChange={updateServerAStatus}
                />
                <span className="toggle-slider"></span>
              </div>
            </label>

            <div className="input-group">
              <input
                type="text"
                placeholder="Server ID"
                value={serverAID}
                onChange={(e) => setServerAID(e.target.value)}
                id="serverAID"
              />
              <button className="btn-primary" onClick={updateServerAID}>Update</button>
            </div>
          </div>
        </div>
        
        <div className="server-card">
          <h2>Server B</h2>
          <div className="control-group">
            <label htmlFor="serverStatusB" className="toggle-label">
              <span className={`status-indicator ${serverBStatus ? 'status-online' : 'status-offline'}`}></span>
              Server Status
              <div className="toggle-switch">
                <input
                  id="serverStatusB"
                  type="checkbox"
                  checked={serverBStatus}
                  onChange={updateServerBStatus}
                />
                <span className="toggle-slider"></span>
              </div>
            </label>

            <div className="input-group">
              <input
                type="text"
                placeholder="Server ID"
                value={serverBID}
                onChange={(e) => setServerBID(e.target.value)}
                id="serverBID"
              />
              <button className="btn-primary" onClick={updateServerBID}>Update</button>
            </div>
          </div>
        </div>
        
        <div className="server-card">
          <h2>Server C</h2>
          <div className="control-group">
            <label htmlFor="serverStatusC" className="toggle-label">
              <span className={`status-indicator ${serverCStatus ? 'status-online' : 'status-offline'}`}></span>
              Server Status
              <div className="toggle-switch">
                <input
                  id="serverStatusC"
                  type="checkbox"
                  checked={serverCStatus}
                  onChange={updateServerCStatus}
                />
                <span className="toggle-slider"></span>
              </div>
            </label>

            <div className="input-group">
              <input
                type="text"
                placeholder="Server ID"
                value={serverCID}
                onChange={(e) => setServerCID(e.target.value)}
                id="serverCID"
              />
              <button className="btn-primary" onClick={updateServerCID}>Update</button>
            </div>
          </div>
        </div>
        
        <div className="server-card">
          <h2>Server D</h2>
          <div className="control-group">
            <label htmlFor="serverStatusD" className="toggle-label">
              <span className={`status-indicator ${serverDStatus ? 'status-online' : 'status-offline'}`}></span>
              Server Status
              <div className="toggle-switch">
                <input
                  id="serverStatusD"
                  type="checkbox"
                  checked={serverDStatus}
                  onChange={updateServerDStatus}
                />
                <span className="toggle-slider"></span>
              </div>
            </label>

            <div className="input-group">
              <input
                type="text"
                placeholder="Server ID"
                value={serverDID}
                onChange={(e) => setServerDID(e.target.value)}
                id="serverDID"
              />
              <button className="btn-primary" onClick={updateServerDID}>Update</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServerControl;
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
    const fetchServerData = async () => {
      try {
        setLoading(true);
        const serverRef = ref(Realtimedb, 'servers');
        onValue(serverRef, (snapshot) => {
          const data = snapshot.val() || {};
          
          // Set event name
          setEventName(data.event_name || '');
          
          // Set server A data
          if (data.server_a) {
            setServerAID(data.server_a.id || '');
            setServerAStatus(data.server_a.status || false);
          }
          
          // Set server B data
          if (data.server_b) {
            setServerBID(data.server_b.id || '');
            setServerBStatus(data.server_b.status || false);
          }
          
          // Set server C data
          if (data.server_c) {
            setServerCID(data.server_c.id || '');
            setServerCStatus(data.server_c.status || false);
          }
          
          // Set server D data
          if (data.server_d) {
            setServerDID(data.server_d.id || '');
            setServerDStatus(data.server_d.status || false);
          }
          
          // Set login status
          setLoginStatus(data.login_status || false);
          
          setLoading(false);
        });
      } catch (error) {
        console.error("Error fetching server data:", error);
        setLoading(false);
      }
    };

    fetchServerData();
  }, []);

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => {
      setMessage('');
    }, 3000);
  };

  const updateEventName = async () => {
    try {
      await set(ref(Realtimedb, 'servers/event_name'), eventName);
      showMessage('Event name updated successfully!');
    } catch (error) {
      console.error("Error updating event name:", error);
      showMessage('Error updating event name.');
    }
  };

  const updateLoginStatus = async () => {
    try {
      const newStatus = !loginStatus;
      await set(ref(Realtimedb, 'servers/login_status'), newStatus);
      setLoginStatus(newStatus);
      showMessage(`Login ${newStatus ? 'enabled' : 'disabled'} successfully!`);
    } catch (error) {
      console.error("Error updating login status:", error);
      showMessage('Error updating login status.');
    }
  };

  const updateServerAStatus = async () => {
    try {
      setLoading(true);
      setMessage('');
      
      // Update both locations for backward compatibility
      await set(ref(Realtimedb, 'servers/server_a/status'), !serverAStatus);
      await set(ref(Realtimedb, 'serverAStatus'), !serverAStatus);
      
      setServerAStatus(!serverAStatus);
      setMessage(`Server A ${!serverAStatus ? 'activated' : 'deactivated'} successfully!`);
    } catch (error) {
      console.error("Error toggling Server A:", error);
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const updateServerBStatus = async () => {
    try {
      setLoading(true);
      setMessage('');
      
      // Update both locations for backward compatibility
      await set(ref(Realtimedb, 'servers/server_b/status'), !serverBStatus);
      await set(ref(Realtimedb, 'serverBStatus'), !serverBStatus);
      
      setServerBStatus(!serverBStatus);
      setMessage(`Server B ${!serverBStatus ? 'activated' : 'deactivated'} successfully!`);
    } catch (error) {
      console.error("Error toggling Server B:", error);
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const updateServerCStatus = async () => {
    try {
      setLoading(true);
      setMessage('');
      
      // Update both locations for backward compatibility
      await set(ref(Realtimedb, 'servers/server_c/status'), !serverCStatus);
      await set(ref(Realtimedb, 'serverCStatus'), !serverCStatus);
      
      setServerCStatus(!serverCStatus);
      setMessage(`Server C ${!serverCStatus ? 'activated' : 'deactivated'} successfully!`);
    } catch (error) {
      console.error("Error toggling Server C:", error);
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const updateServerDStatus = async () => {
    try {
      setLoading(true);
      setMessage('');
      
      // Update both locations for backward compatibility
      await set(ref(Realtimedb, 'servers/server_d/status'), !serverDStatus);
      await set(ref(Realtimedb, 'serverDStatus'), !serverDStatus);
      
      setServerDStatus(!serverDStatus);
      setMessage(`Server D ${!serverDStatus ? 'activated' : 'deactivated'} successfully!`);
    } catch (error) {
      console.error("Error toggling Server D:", error);
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const updateServerAID = async () => {
    try {
      await set(ref(Realtimedb, 'servers/server_a/id'), serverAID);
      showMessage('Server A ID updated successfully!');
    } catch (error) {
      console.error("Error updating Server A ID:", error);
      showMessage('Error updating Server A ID.');
    }
  };

  const updateServerBID = async () => {
    try {
      await set(ref(Realtimedb, 'servers/server_b/id'), serverBID);
      showMessage('Server B ID updated successfully!');
    } catch (error) {
      console.error("Error updating Server B ID:", error);
      showMessage('Error updating Server B ID.');
    }
  };

  const updateServerCID = async () => {
    try {
      await set(ref(Realtimedb, 'servers/server_c/id'), serverCID);
      showMessage('Server C ID updated successfully!');
    } catch (error) {
      console.error("Error updating Server C ID:", error);
      showMessage('Error updating Server C ID.');
    }
  };

  const updateServerDID = async () => {
    try {
      await set(ref(Realtimedb, 'servers/server_d/id'), serverDID);
      showMessage('Server D ID updated successfully!');
    } catch (error) {
      console.error("Error updating Server D ID:", error);
      showMessage('Error updating Server D ID.');
    }
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
        
        {/* Server cards continue... */}
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
        
        {/* Remaining server cards... */}
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
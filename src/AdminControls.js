import React, {useEffect, useState} from 'react';
import {onValue, ref, set} from "firebase/database";
import {Realtimedb} from "./util/firebase";
import './AdminControls.css';

export function AdminControls() {

    const [loginStatus, setLoginStatus] = useState(false);
    const [eventName, setEventName] = useState('');
    const [message, setMessage] = useState('');

    const [serverAID, setServerAID] = useState('');
    const [serverAStatus, setServerAStatus] = useState(false);

    const [serverBID, setServerBID] = useState('');
    const [serverBStatus, setServerBStatus] = useState(false);

    const [serverCID, setServerCID] = useState('');
    const [serverCStatus, setServerCStatus] = useState(false);

    const [serverDID, setServerDID] = useState('');
    const [serverDStatus, setServerDStatus] = useState(false);

    useEffect(() => {
        const loginStatusRef = ref(Realtimedb, 'loginStatus');
        onValue(loginStatusRef, (snapshot) => {
            const data = snapshot.val();
            setLoginStatus(data);
            document.getElementById('loginStatus').checked = data;
        });

        const eventNameRef = ref(Realtimedb, 'miqaatName');
        onValue(eventNameRef, (snapshot) => {
            const data = snapshot.val();
            setEventName(data);
            document.getElementById('miqaatName').value = data;
        });

        const serverAIDRef = ref(Realtimedb, 'serverAID');
        onValue(serverAIDRef, (snapshot) => {
            const data = snapshot.val();
            setServerAID(data);
            document.getElementById('serverAID').value = data;
        });

        const serverAStatusRef = ref(Realtimedb, 'serverAStatus');
        onValue(serverAStatusRef, (snapshot) => {
            const data = snapshot.val();
            setServerAStatus(data);
            document.getElementById('serverStatusA').checked = data;
        });

        const serverBIDRef = ref(Realtimedb, 'serverBID');
        onValue(serverBIDRef, (snapshot) => {
            const data = snapshot.val();
            setServerBID(data);
            document.getElementById('serverBID').value = data;
        });

        const serverBStatusRef = ref(Realtimedb, 'serverBStatus');
        onValue(serverBStatusRef, (snapshot) => {
            const data = snapshot.val();
            setServerBStatus(data);
            document.getElementById('serverStatusB').checked = data;
        });

        const serverCIDRef = ref(Realtimedb, 'serverCID');
        onValue(serverCIDRef, (snapshot) => {
            const data = snapshot.val();
            setServerCID(data);
            document.getElementById('serverCID').value = data;
        });

        const serverCStatusRef = ref(Realtimedb, 'serverCStatus');
        onValue(serverCStatusRef, (snapshot) => {
            const data = snapshot.val();
            setServerCStatus(data);
            document.getElementById('serverStatusC').checked = data;
        });

        const serverDIDRef = ref(Realtimedb, 'serverDID');
        onValue(serverDIDRef, (snapshot) => {
            const data = snapshot.val();
            setServerDID(data);
            document.getElementById('serverDID').value = data;
        });

        const serverDStatusRef = ref(Realtimedb, 'serverDStatus');
        onValue(serverDStatusRef, (snapshot) => {
            const data = snapshot.val();
            setServerDStatus(data);
            document.getElementById('serverStatusD').checked = data;
        });

    }, [loginStatus]);

    const updateLoginStatus = () => {
        const newLoginStatus = document.getElementById("loginStatus").checked;
        setLoginStatus(newLoginStatus);
        set(ref(Realtimedb, "loginStatus"), newLoginStatus);
    }

    const updateEventName = () => {
        const eventName = document.getElementById('miqaatName').value;
        if (eventName === '') {
            setMessage("Event Name cannot be empty");
            setTimeout(() => {
                setMessage("");
            }, 2000);
            return;
        }
        set(ref(Realtimedb, 'miqaatName'), eventName);
        setMessage("Event Name Updated");
        setTimeout(() => {
            setMessage("");
        }, 2000);
    }

    const updateServerAID = () => {
        const newServerAID = document.getElementById("serverAID").value;
        setServerAID(newServerAID);
        set(ref(Realtimedb, "serverAID"), newServerAID);
        setMessage("Server A URL Updated");

        setTimeout(() => {
            setMessage("");
        }, 2000);
    }

    const updateServerAStatus = () => {
        const newServerAStatus = document.getElementById("serverStatusA").checked;
        setServerAStatus(newServerAStatus);
        set(ref(Realtimedb, "serverAStatus"), newServerAStatus);
    }

    const updateServerBID = () => {
        const newServerBID = document.getElementById("serverBID").value;
        setServerBID(newServerBID);
        set(ref(Realtimedb, "serverBID"), newServerBID);
        setMessage("Server B ID Updated");
        setTimeout(() => {
            setMessage("");
        }, 2000);
    }

    const updateServerBStatus = () => {
        const newServerBStatus = document.getElementById("serverStatusB").checked;
        setServerBStatus(newServerBStatus);
        set(ref(Realtimedb, "serverBStatus"), newServerBStatus);
    }

    const updateServerCID = () => {
        const newServerCID = document.getElementById("serverCID").value;
        setServerCID(newServerCID);
        set(ref(Realtimedb, "serverCID"), newServerCID);
        setMessage("Server C ID Updated");
        setTimeout(() => {
            setMessage("");
        }, 2000);
    }

    const updateServerCStatus = () => {
        const newServerCStatus = document.getElementById("serverStatusC").checked;
        setServerCStatus(newServerCStatus);
        set(ref(Realtimedb, "serverCStatus"), newServerCStatus);
    }

    const updateServerDID = () => {
        const newServerDID = document.getElementById("serverDID").value;
        setServerDID(newServerDID);
        set(ref(Realtimedb, "serverDID"), newServerDID);
        setMessage("Server D ID Updated");
        setTimeout(() => {
            setMessage("");
        }, 2000);
    }

    const updateServerDStatus = () => {
        const newServerDStatus = document.getElementById("serverStatusD").checked;
        setServerDStatus(newServerDStatus);
        set(ref(Realtimedb, "serverDStatus"), newServerDStatus);
    }

    // Update the return section of AdminControls.js
    // Find the return statement and enhance it:
    
    return (
        <div className="admin-control-container">
            {message && <div className="message-container show">{message}</div>}
            
            <div className="admin-content">
                <div className="server-controls">
                    <h3>System Controls</h3>
                    <div className="control-group">
                        <label htmlFor="loginStatus">
                            <span className={`status-indicator ${loginStatus ? 'status-online' : 'status-offline'}`}></span>
                            Login Status:
                            <input
                                id="loginStatus"
                                type="checkbox"
                                value={loginStatus ? 'true' : 'false'}
                                onChange={() => updateLoginStatus()}
                            />
                        </label>

                        <input
                            type="text"
                            placeholder="Event Name"
                            value={eventName}
                            onChange={(e) => setEventName(e.target.value)}
                            id="miqaatName"
                        />

                        <button className="registerBtn" onClick={() => updateEventName()}>Update Event Name</button>
                    </div>
                </div>

                <div className="server-controls">
                    <h3>Server A Configuration</h3>
                    <div className="control-group">
                        <label htmlFor="serverStatusA">
                            <span className={`status-indicator ${serverAStatus ? 'status-online' : 'status-offline'}`}></span>
                            Server A Status:
                            <input
                                id="serverStatusA"
                                type="checkbox"
                                value={serverAStatus ? 'true' : 'false'}
                                onChange={() => updateServerAStatus()}
                            />
                        </label>

                        <input
                            type="text"
                            placeholder="Server A ID"
                            value={serverAID}
                            onChange={(e) => setServerAID(e.target.value)}
                            id="serverAID"
                        />

                        <button className="registerBtn" onClick={() => updateServerAID()}>Update Server A ID</button>
                    </div>
                </div>

                <div className="server-controls">
                    <h3>Server B Configuration</h3>
                    <div className="control-group">
                        <label htmlFor="serverStatusB">
                            <span className={`status-indicator ${serverBStatus ? 'status-online' : 'status-offline'}`}></span>
                            Server B Status:
                            <input
                                id="serverStatusB"
                                type="checkbox"
                                value={serverBStatus ? 'true' : 'false'}
                                onChange={() => updateServerBStatus()}
                            />
                        </label>

                        <input
                            type="text"
                            placeholder="Server B ID"
                            value={serverBID}
                            onChange={(e) => setServerBID(e.target.value)}
                            id="serverBID"
                        />

                        <button className="registerBtn" onClick={() => updateServerBID()}>Update Server B ID</button>
                    </div>
                </div>

                <div className="server-controls">
                    <h3>Server C Configuration</h3>
                    <div className="control-group">
                        <label htmlFor="serverStatusC">
                            <span className={`status-indicator ${serverCStatus ? 'status-online' : 'status-offline'}`}></span>
                            Server C Status:
                            <input
                                id="serverStatusC"
                                type="checkbox"
                                value={serverCStatus ? 'true' : 'false'}
                                onChange={() => updateServerCStatus()}
                            />
                        </label>

                        <input
                            type="text"
                            placeholder="Server C ID"
                            value={serverCID}
                            onChange={(e) => setServerCID(e.target.value)}
                            id="serverCID"
                        />

                        <button className="registerBtn" onClick={() => updateServerCID()}>Update Server C ID</button>
                    </div>
                </div>

                <div className="server-controls">
                    <h3>Server D Configuration</h3>
                    <div className="control-group">
                        <label htmlFor="serverStatusD">
                            <span className={`status-indicator ${serverDStatus ? 'status-online' : 'status-offline'}`}></span>
                            Server D Status:
                            <input
                                id="serverStatusD"
                                type="checkbox"
                                value={serverDStatus ? 'true' : 'false'}
                                onChange={() => updateServerDStatus()}
                            />
                        </label>

                        <input
                            type="text"
                            placeholder="Server D ID"
                            value={serverDID}
                            onChange={(e) => setServerDID(e.target.value)}
                            id="serverDID"
                        />

                        <button className="registerBtn" onClick={() => updateServerDID()}>Update Server D ID</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
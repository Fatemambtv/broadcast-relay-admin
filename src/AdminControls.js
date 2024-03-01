import React, { useEffect, useState } from 'react';
import { ref, set, onValue } from "firebase/database";
import { Realtimedb } from "./util/firebase";
import './AdminControls.css';

export function AdminControls() {

    const [loginStatus, setLoginStatus] = useState(false);
    const [miqaatName, setMiqaatName] = useState('');
    const [message, setMessage] = useState('');

    const [serverAID, setServerAID] = useState('');
    const [serverAStatus, setServerAStatus] = useState(false);

    const [serverBID, setServerBID] = useState('');
    const [serverBStatus, setServerBStatus] = useState(false);

    const [serverCID, setServerCID] = useState('');
    const [serverCStatus, setServerCStatus] = useState(false);

    useEffect(() => {
        const loginStatusRef = ref(Realtimedb, 'loginStatus');
        onValue(loginStatusRef, (snapshot) => {
            const data = snapshot.val();
            setLoginStatus(data);
            document.getElementById('loginStatus').checked = data;
        });

        const miqaatNameRef = ref(Realtimedb, 'miqaatName');
        onValue(miqaatNameRef, (snapshot) => {
            const data = snapshot.val();
            setMiqaatName(data);
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


    }, [loginStatus]);

    const updateLoginStatus = () => {
        const newLoginStatus = document.getElementById("loginStatus").checked;
        setLoginStatus(newLoginStatus);
        set(ref(Realtimedb, "loginStatus"), newLoginStatus);
    }

    const updateMiqaatName = () => {
        const miqaatName = document.getElementById('miqaatName').value;
        if (miqaatName === '') {
            setMessage("Miqaat Name cannot be empty");
            setTimeout(() => {
                setMessage("");
            }, 2000);
            return;
        }
        set(ref(Realtimedb, 'miqaatName'), miqaatName);
        setMessage("Miqaat Name Updated");
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

    return (
        <div className='admin-control-container'>
            <div className='content'>
                <div className="form-container">
                    <label htmlFor='loginStatus'>
                        Login Status:
                        <input
                            id='loginStatus'
                            type="checkbox"
                            value={loginStatus ? 'true' : 'false'}
                            onChange={() => updateLoginStatus()}
                        />
                    </label>

                    <input
                        type="text"
                        placeholder="Miqaat Name"
                        value={miqaatName}
                        onChange={(e) => setMiqaatName(e.target.value)}
                        id="miqaatName"
                    />

                    <button className='registerBtn' onClick={() => updateMiqaatName()}>Update Miqaat Name</button>

                </div>
                <div className="form-container">
                    <label htmlFor='serverStatusA'>
                        Server A (Custom):
                        <input
                            id='serverStatusA'
                            type="checkbox"
                            value={serverAStatus ? 'true' : 'false'}
                            onChange={() => updateServerAStatus()}
                        />
                    </label>

                    <input
                        type="text"
                        placeholder="Server A URL"
                        value={serverAID}
                        onChange={(e) => setServerAID(e.target.value)}
                        id="serverAID"
                    />

                    <button className='registerBtn' onClick={() => updateServerAID()}>SET A</button>
                </div>
                <div className="form-container">
                    <label htmlFor='serverStatusB'>
                        Server B (YT):
                        <input
                            id='serverStatusB'
                            type="checkbox"
                            value={serverBStatus ? 'true' : 'false'}
                            onChange={() => updateServerBStatus()}
                        />
                    </label>

                    <input
                        type="text"
                        placeholder="youtube ID: kZwg8U_RCsg"
                        value={serverBID}
                        onChange={(e) => setServerBID(e.target.value)}
                        id="serverBID"
                    />

                    <button className='registerBtn' onClick={() => updateServerBID()}>SET B</button>
                </div>

                <div className="form-container">
                    <label htmlFor='serverStatusC'>
                        Server C (Drive):
                        <input
                            id='serverStatusC'
                            type="checkbox"
                            value={serverCStatus ? 'true' : 'false'}
                            onChange={() => updateServerCStatus()}
                        />
                    </label>

                    <input
                        type="text"
                        placeholder="Drive video ID: 1-C9yYnyDhZGhQEi0gDqv2DbDD13gScGv"
                        value={serverCID}
                        onChange={(e) => setServerCID(e.target.value)}
                        id="serverCID"
                    />

                    <button className='registerBtn' onClick={() => updateServerCID()}>SET C</button>
                </div>
            </div>
            <p>{message}</p>
        </div>
    );
}
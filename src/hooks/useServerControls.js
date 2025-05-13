import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../util/firebase';

const useServerControls = () => {
  const [servers, setServers] = useState({
    A: { id: '', status: false },
    B: { id: '', status: false },
    C: { id: '', status: false },
  });
  const [loginStatus, setLoginStatus] = useState(false);
  const [eventName, setEventName] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loginStatusRef = doc(db, 'system', 'loginStatus');
    const eventNameRef = doc(db, 'system', 'eventName');
    const serverRefs = {
      A: doc(db, 'servers', 'A'),
      B: doc(db, 'servers', 'B'),
      C: doc(db, 'servers', 'C'),
    };

    const unsubscribes = [
      onSnapshot(loginStatusRef, (snap) => setLoginStatus(snap.data()?.status || false)),
      onSnapshot(eventNameRef, (snap) => setEventName(snap.data()?.name || '')),
      ...Object.entries(serverRefs).map(([server, ref]) =>
        onSnapshot(ref, (snap) => {
          const data = snap.data();
          setServers((prev) => ({
            ...prev,
            [server]: { id: data?.id || '', status: data?.status || false },
          }));
        })
      ),
    ];

    return () => unsubscribes.forEach((unsubscribe) => unsubscribe());
  }, []);

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 2000);
  };

  const updateServer = async (server, field, value) => {
    const serverRef = doc(db, 'servers', server);
    await setDoc(serverRef, { [field.toLowerCase()]: value }, { merge: true });
    setServers((prev) => ({
      ...prev,
      [server]: { ...prev[server], [field.toLowerCase()]: value },
    }));
    showMessage(`Server ${server} ${field} updated`);
  };

  const handleServerIDChange = (server, id) => {
    setServers((prev) => ({ ...prev, [server]: { ...prev[server], id } }));
  };

  const updateLoginStatus = async (status) => {
    const loginStatusRef = doc(db, 'system', 'loginStatus');
    await setDoc(loginStatusRef, { status });
    setLoginStatus(status);
    showMessage(`Login ${status ? 'enabled' : 'disabled'}`);
  };

  const updateEventName = async (name) => {
    if (!name) {
      showMessage('Event name cannot be empty');
      return;
    }
    const eventNameRef = doc(db, 'system', 'eventName');
    await setDoc(eventNameRef, { name });
    setEventName(name);
    showMessage('Event name updated');
  };

  const handleEventNameChange = (name) => {
    setEventName(name);
  };

  return { servers, loginStatus, eventName, message, updateServer, handleServerIDChange, updateLoginStatus, updateEventName, handleEventNameChange };
};

export default useServerControls;
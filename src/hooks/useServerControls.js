import { useState, useEffect } from 'react';
import { ref, onValue, set, off } from 'firebase/database';
import { Realtimedb } from '../util/firebase';

const useServerControls = () => {
  const [servers, setServers] = useState({
    A: { id: '', status: false },
    B: { id: '', status: false },
    C: { id: '', status: false },
    D: { id: '', status: false },
  });
  const [loginStatus, setLoginStatus] = useState(false);
  const [eventName, setEventName] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const refs = {
      loginStatus: ref(Realtimedb, 'loginStatus'),
      eventName: ref(Realtimedb, 'eventName'),
      ...Object.fromEntries(
        ['A', 'B', 'C', 'D'].flatMap((server) => [
          [`server${server}ID`, ref(Realtimedb, `server${server}ID`)],
          [`server${server}Status`, ref(Realtimedb, `server${server}Status`)],
        ])
      ),
    };

    const listeners = {
      loginStatus: onValue(refs.loginStatus, (snap) => setLoginStatus(snap.val() || false)),
      eventName: onValue(refs.eventName, (snap) => setEventName(snap.val() || '')),
      ...Object.fromEntries(
        ['A', 'B', 'C', 'D'].flatMap((server) => [
          [`server${server}ID`, 
            onValue(refs[`server${server}ID`], (snap) =>
              setServers((prev) => ({ ...prev, [server]: { ...prev[server], id: snap.val() || '' } }))
            )
          ],
          [`server${server}Status`,
            onValue(refs[`server${server}Status`], (snap) =>
              setServers((prev) => ({ ...prev, [server]: { ...prev[server], status: snap.val() || false } }))
            )
          ],
        ])
      ),
    };

    return () => Object.values(refs).forEach((reference) => off(reference));
  }, []);

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 2000);
  };

  const updateServer = async (server, field, value) => {
    await set(ref(Realtimedb, `server${server}${field}`), value);
    setServers((prev) => ({ ...prev, [server]: { ...prev[server], [field.toLowerCase()]: value } }));
    showMessage(`Server ${server} ${field} updated`);
  };

  const updateLoginStatus = async (status) => {
    await set(ref(Realtimedb, 'loginStatus'), status);
    setLoginStatus(status);
    showMessage(`Login ${status ? 'enabled' : 'disabled'}`);
  };

  const updateEventName = async (name) => {
    if (!name) {
      showMessage('Event name cannot be empty');
      return;
    }
    await set(ref(Realtimedb, 'eventName'), name);
    setEventName(name);
    showMessage('Event name updated');
  };

  return { servers, loginStatus, eventName, message, updateServer, updateLoginStatus, updateEventName };
};

export default useServerControls;
// AuthComponent.js
import React, { useState, useEffect } from 'react';
import { doc, setDoc, collection, getDocs, deleteDoc } from "firebase/firestore";
import { ref, set, onValue } from "firebase/database";
import { db, RealTimeDB } from "./util/firebase";
import './AuthComponent.css';

const AuthComponent = () => {
  const [its, setITS] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [onlineStatus, setOnlineStatus] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Fetch online status for each user from the Realtime Database
    const fetchOnlineStatusForUsers = async () => {
      try {
        setLoading(true);
        const onlineStatusRef = ref(RealTimeDB, 'loggedInUsers');
        onValue(onlineStatusRef, (snapshot) => {
          const data = snapshot.val();
          // Set online status for each user
          setOnlineStatus(data || {});
          setLoading(false);
        });
      } catch (err) {
        console.error("Error fetching online status:", err);
        setLoading(false);
      }
    };

    fetchOnlineStatusForUsers();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCollection = collection(db, "users");
        const usersSnapshot = await getDocs(usersCollection);
        const usersData = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          showPassword: false,
        }));
        setUsers(usersData);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchUsers();
  }, []);

  const generatePassword = (name, its) => {
    if (name && name.length > 0) {
      setPassword(name.charAt(0).toLowerCase() + its.slice(-4));
    } else {
      setPassword(its.slice(-4));
      return;
    }
  }

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.id.includes(searchTerm)
  );

  const handleSignUp = async (its, password, name) => {
    try {
      await setDoc(doc(db, "users", its), {
        name: name,
        password: password
      });
      setError("User created successfully....reloading");
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteUser = async (uid) => {
    try {
      await deleteDoc(doc(db, "users", uid));
      setError("User deleted successfully....reloading");
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSignOut = async (its) => {
    await set(ref(RealTimeDB, `/loggedInUsers/${its}/login_status`), false);
  }

  const handleNameChange = (e) => {
    const newName = e.target.value;
    setName(newName);
    generatePassword(newName, its);
  };

  const handleITSChange = (e) => {
    const newITS = e.target.value;
    setITS(newITS);
    generatePassword(name, newITS);
  };

  const handleTogglePassword = (its) => {
    setUsers(prevUsers => {
      return prevUsers.map(user => {
        if (user.id === its) {
          return { ...user, showPassword: !user.showPassword };
        }
        return user;
      });
    });
  };

  return (
    <div className="auth-container">
      <h1>User Authentication</h1>

      <div className="form-container">
        <input
          type="name"
          placeholder="Name"
          value={name}
          onChange={handleNameChange}
        />
        <input
          type="text"
          placeholder="ITS ID"
          value={its}
          maxLength={8}
          onChange={handleITSChange}
        />

        <p>Password: {password}</p>

        <button className='registerBtn' onClick={() => handleSignUp(its, password, name)}>Register</button>
        {error && <p className="error-message">{error}</p>}
      </div>

      <div className="users-container">
        <h2>Users:</h2>
        <input
          className='search-bar'
          type="text"
          placeholder="Search by Name or ITS ID"
          value={searchTerm}
          onChange={handleSearch}
        />
        <span className='reload' onClick={() => { window.location.reload() }}>↻</span>
        {filteredUsers.length === 0 ? (
          <p className="no-results-message">No results found.</p>
        ) : (
          filteredUsers.map((user, index) => (
            <div className='user-container' key={user.id}>
              <span>Last login: {onlineStatus[user.id]?.login_time}</span>
              <li className='user'>
                <span
                  className="online-status"
                  style={{ backgroundColor: loading ? "#ccc" : onlineStatus[user.id]?.login_status ? "green" : "red" }}
                ></span>
                <span>{user.name}</span><hr></hr>
                <span>{user.id}</span><hr></hr>
                <span className="password-container">
                  <span className="password">{user.showPassword ? user.password : '*****'}</span>
                  <button className="toggle-password" onClick={() => handleTogglePassword(user.id)}>
                    {user.showPassword ? "Hide" : "Show"}
                  </button>
                </span>
                {index < filteredUsers.length - 1 && <div className="column-divider"></div>}
                <button className="delete-button" onClick={() => handleDeleteUser(user.id)}>Delete</button>
                <button className="signout-button" onClick={() => handleSignOut(user.id)}>Sign Out</button>
              </li>
            </div>
          )))}
      </div>
    </div>
  );
};

export default AuthComponent;

// AuthComponent.js
import React, { useState, useEffect } from 'react';
import { doc, setDoc, collection, getDocs, deleteDoc } from "firebase/firestore";
import { ref, set, onValue } from "firebase/database";
import { db, Realtimedb } from "./util/firebase";
import './styles/AuthComponent.css';
import { AdminControls } from './AdminControls';

const AuthComponent = ({ isLoggedIn, onLogout }) => {
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
        const onlineStatusRef = ref(Realtimedb, 'loggedInUsers');
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
  useEffect(() => {
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
    if (!its || !name) {
      setError("Please fill all the fields.");
      return;
    }
    try {
      await setDoc(doc(db, "users", its), {
        name: name,
        password: password
      });
      setError("User created successfully....reloading");
      fetchUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteUser = async (uid) => {
    try {
      await deleteDoc(doc(db, "users", uid));
      setError("User deleted successfully....reloading");
      fetchUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSignOut = async (its) => {
    await set(ref(Realtimedb, `/loggedInUsers/${its}/login_status`), false);
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

  const handleAdminSignout = async () => {
    await set(ref(Realtimedb, `/loggedInUsers/admin/login_status`), false);
    onLogout();
  }

  // Update just the header part of AuthComponent.js
  // Find the header div around line 135-139 and replace with:
  
    return (
      <div className="auth-container">
        <div className='header'>
          <h1>
            <img src="https://img.icons8.com/fluency/48/000000/broadcast.png" alt="Admin Icon" />
            Broadcast Relay Admin Panel
          </h1>
          <button className='registerBtn' onClick={handleAdminSignout}>Logout</button>
        </div>
        <AdminControls />
        
        {/* Rest of the component remains the same */}
        <div className='admin-controls'>
          <div className="form-container">
            <input
              type="name"
              placeholder="Name"
              value={name}
              onChange={handleNameChange}
            />
            <input
              type="text"
              placeholder="User ID"
              value={its}
              maxLength={8}
              onChange={handleITSChange}
            />
  
            <p>Password: {password}</p>
  
            <button className='registerBtn' onClick={() => handleSignUp(its, password, name)}>Register</button>
            {error && <p className="error-message">{error}</p>}
          </div>
          
        </div>
  
        <div className="users-container">
          <h2>Users:</h2>
          <input
            className='search-bar'
            type="text"
            placeholder="Search by Name or User ID"
            value={searchTerm}
            onChange={handleSearch}
          />
          <span className='reload' onClick={fetchUsers}>↻</span>
          {filteredUsers.length === 0 ? (
            <p className="no-results-message">No results found.</p>
          ) : (
            filteredUsers.map((user, index) => (
              <div className='user-container' key={user.id}>
                <li className='user'>
                  <span
                    className="online-status"
                    style={{ backgroundColor: loading ? "#ccc" : onlineStatus[user.id]?.login_status ? "green" : "red" }}
                  ></span>
                  <div>
                    <div className='details'>
                      <span>{user.name}</span><hr></hr>
                      <span>{user.id}</span><hr></hr>
                    </div>
                    <br></br>
                    <span>Last login: {onlineStatus[user.id]?.login_time}</span>
                  </div>
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

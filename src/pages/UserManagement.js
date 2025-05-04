import React, { useState, useEffect } from 'react';
import { HiOutlineRefresh } from 'react-icons/hi';
import { CgLogOut } from 'react-icons/cg';
import { RiDeleteBinLine, RiRefreshLine, RiKeyLine } from 'react-icons/ri';
import { IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5';
import { doc, setDoc, collection, getDocs, deleteDoc, getDoc } from "firebase/firestore";
import { ref, set, onValue, get } from "firebase/database";
import { db, Realtimedb, auth } from "../util/firebase";
import { createUserWithEmailAndPassword } from 'firebase/auth';
import UserIcon from '../assets/icons/UserIcon';
import '../styles/index.css';

const UserManagement = () => {
  const [its, setITS] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [onlineStatus, setOnlineStatus] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Define inactivity timeout (in milliseconds) - 30 minutes
  const INACTIVITY_TIMEOUT = 30 * 60 * 1000;

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
          
          // Check for inactive users
          checkInactiveUsers(data || {});
        });
      } catch (err) {
        console.error("Error fetching online status:", err);
        setLoading(false);
      }
    };

    fetchOnlineStatusForUsers();
    
    // Set up interval to check for inactive users every 5 minutes
    const inactivityInterval = setInterval(() => {
      const onlineStatusRef = ref(Realtimedb, 'loggedInUsers');
      get(onlineStatusRef).then((snapshot) => {
        const data = snapshot.val();
        checkInactiveUsers(data || {});
      });
    }, 5 * 60 * 1000);
    
    // Clean up interval on component unmount
    return () => clearInterval(inactivityInterval);
  }, []);
  
  // Function to check for inactive users and log them out
  const checkInactiveUsers = (usersData) => {
    const currentTime = new Date().getTime();
    
    Object.entries(usersData).forEach(([userId, userData]) => {
      // Skip admin user
      if (userId === 'admin') return;
      
      // Check if user is logged in
      if (userData.login_status) {
        // Get last activity time
        const lastActivity = userData.last_activity ? new Date(userData.last_activity).getTime() : null;
        
        // If last_activity exists and user has been inactive for longer than the timeout
        if (lastActivity && (currentTime - lastActivity > INACTIVITY_TIMEOUT)) {
          console.log(`User ${userId} inactive for too long. Logging out.`);
          handleSignOut(userId);
        }
      }
    });
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const usersCollection = collection(db, "users");
      const usersSnapshot = await getDocs(usersCollection);
      const usersData = usersSnapshot.docs
        .filter(doc => !doc.data().isAdmin)
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          showPassword: false // Add showPassword flag
        }));
      setUsers(usersData);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const generatePassword = (name, its) => {
    if (name && name.length > 0 && its && its.length > 0) {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$';
      let randomPassword = '';
      
      randomPassword += name.charAt(0).toLowerCase();
      
      if (its.length >= 4) {
        randomPassword += its.slice(-4);
      }
      
      while (randomPassword.length < 8) {
        randomPassword += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      
      setPassword(randomPassword);
    } else {
      setPassword('');
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.id.includes(searchTerm)
  );

  const handleSignUp = async (its, password, name) => {
    if (!its || !name || !password) {
      setError("Please fill all the fields.");
      setSuccess(null);
      return;
    }
    
    try {
      setLoading(true);
      
      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        `${its}@broadcastrelay.com`,
        password
      );
      
      const uid = userCredential.user.uid;
      
      // Store metadata in Firestore
      await setDoc(doc(db, "users", uid), {
        name,
        its,
        role: 'user',
        createdAt: new Date().toISOString(),
        userType: 'regular',
        isAdmin: false
      });
      
      setSuccess("User created successfully!");
      setError(null);
      setITS('');
      setName('');
      setPassword('');
      fetchUsers();
    } catch (err) {
      setError(err.message);
      setSuccess(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (uid) => {
    if (window.confirm(`Are you sure you want to delete user ${uid}?`)) {
      try {
        setLoading(true);
        
        // Get the user document from Firestore
        const userDoc = await getDoc(doc(db, "users", uid));
        const userData = userDoc.data();
        
        if (userData && userData.its) {
          // Delete from Firebase Authentication (client-side note)
          console.log("Would delete auth user if this was server-side");
        }
        
        // Delete from Firestore
        await deleteDoc(doc(db, "users", uid));
        
        // Delete from Realtime Database
        if (userData && userData.its) {
          await set(ref(Realtimedb, `loggedInUsers/${userData.its}`), null);
        }
        
        setSuccess("User deleted successfully!");
        setError(null);
        fetchUsers();
      } catch (err) {
        setError(err.message);
        setSuccess(null);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSignOut = async (its) => {
    try {
      setLoading(true);
      await set(ref(Realtimedb, `/loggedInUsers/${its}/login_status`), false);
      setSuccess(`User ${its} signed out successfully!`);
      setError(null);
    } catch (err) {
      setError(err.message);
      setSuccess(null);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (userId) => {
    const newPassword = prompt("Enter new password for user:");
    if (!newPassword) {
      setError("Password change cancelled.");
      return;
    }
    
    try {
      setLoading(true);
      setSuccess(`Password for user would be changed (requires Firebase Admin SDK)`);
      setError(null);
    } catch (err) {
      setError(err.message);
      setSuccess(null);
    } finally {
      setLoading(false);
    }
  };

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
    <div className="card">
      <h1 className="title">User Management</h1>
      
      {error && <div className="error-message" aria-live="polite">{error}</div>}
      {success && <div className="success-message" aria-live="polite">{success}</div>}
      
      <div className="section">
        <h2 className="subtitle">Add New User</h2>
        <div className="form-group">
          <div className="form-field">
            <label htmlFor="name" className="form-label">Full Name</label>
            <input
              className="input"
              type="text"
              id="name"
              placeholder="Enter user's full name"
              value={name}
              onChange={handleNameChange}
              aria-label="Full name"
            />
          </div>
          
          <div className="form-field">
            <label htmlFor="its" className="form-label">User ID</label>
            <input
              className="input"
              type="text"
              id="its"
              placeholder="Enter user ID"
              value={its}
              onChange={handleITSChange}
              maxLength={8}
              aria-label="User ID"
            />
          </div>
          
          <div className="form-field">
            <label htmlFor="password" className="form-label">Password</label>
            <div className="input-group">
              <input
                className="input input-with-button"
                type="text"
                id="password"
                placeholder="Password will be generated"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-label="Password"
              />
              <button 
                className="flat-button"
                onClick={() => generatePassword(name, its)}
                title="Generate Password"
                aria-label="Generate password"
              >
                <RiRefreshLine size={16} />
              </button>
            </div>
          </div>
          
          <button 
            className="button button-primary form-button"
            onClick={() => handleSignUp(its, password, name)}
            disabled={loading}
          >
            {loading ? <div className="spinner spinner-small spinner-primary" /> : 'Add User'}
          </button>
        </div>
      </div>
      
      {/* <div className="section"> */}
        <div className="section-header">
          <h2 className="subtitle">Registered Users</h2>
          <div className="section-controls">
            <input
              className="input search-input"
              type="text"
              placeholder="Search by name or ID..."
              value={searchTerm}
              onChange={handleSearch}
              aria-label="Search users"
            />
            <button 
              className="flat-button"
              onClick={fetchUsers}
              title="Refresh user list"
              aria-label="Refresh user list"
            >
              <HiOutlineRefresh size={18} />
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="text-center" aria-live="polite">
            <div className="spinner spinner-medium spinner-primary" />
            <p className="mt-2">Loading users...</p>
          </div>
        ) : (
          <>
            {filteredUsers.length === 0 ? (
              <p className="text-center">No users found.</p>
            ) : (
              <div className="user-list">
                {filteredUsers.map(user => (
                  <div key={user.id} className="user-row">
                    <div className="user-info">
                      <UserIcon className="user-icon" aria-label="User" />
                      <span className="user-name">{user.name}</span>
                      <span className="user-id">ID: {user.id}</span>
                      <span 
                        className="status-dot"
                        style={{ 
                          backgroundColor: onlineStatus[user.id]?.login_status ? 'var(--success)' : 'var(--danger)'
                        }}
                        title={onlineStatus[user.id]?.login_status ? 'Online' : 'Offline'}
                        aria-label={onlineStatus[user.id]?.login_status ? 'User online' : 'User offline'}
                      />
                    </div>
                    <div className="row-actions">
                      <span className="password-text">{user.showPassword ? user.password : '••••••••'}</span>
                      <button 
                        className="flat-button"
                        onClick={() => handleTogglePassword(user.id)}
                        title={user.showPassword ? "Hide password" : "Show password"}
                        aria-label={user.showPassword ? "Hide password" : "Show password"}
                      >
                        {user.showPassword ? <IoEyeOffOutline size={16} /> : <IoEyeOutline size={16} />}
                      </button>
                      <button 
                        className="flat-button"
                        onClick={() => handleChangePassword(user.id)}
                        title="Change password"
                        aria-label="Change password"
                      >
                        <RiKeyLine size={16} />
                      </button>
                      {onlineStatus[user.id]?.login_status && (
                        <button 
                          className="flat-button warning-icon"
                          onClick={() => handleSignOut(user.id)}
                          title="Sign out user"
                          aria-label="Sign out user"
                        >
                          <CgLogOut size={16} />
                        </button>
                      )}
                      <button 
                        className="flat-button danger-icon"
                        onClick={() => handleDeleteUser(user.id)}
                        title="Delete user"
                        aria-label="Delete user"
                      >
                        <RiDeleteBinLine size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      {/* </div> */}
    </div>
  );
};

export default UserManagement;
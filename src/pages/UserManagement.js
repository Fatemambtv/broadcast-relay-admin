import React, { useState, useEffect } from 'react';
import { HiOutlineRefresh } from 'react-icons/hi';
import { CgLogOut } from 'react-icons/cg';
import { RiDeleteBinLine } from 'react-icons/ri';
import { IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5';
import { doc, setDoc, collection, getDocs, deleteDoc } from "firebase/firestore";
import { ref, set, onValue, get } from "firebase/database";
import { db, Realtimedb } from "../util/firebase";
import LoadingSpinner from '../components/LoadingSpinner';
import './UserManagement.css';

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
        .filter(doc => doc.id !== 'admin') // Exclude admin user
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          showPassword: false,
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

  // Replace the existing generatePassword function with this one
  const generatePassword = (name, its) => {
    if (name && name.length > 0 && its && its.length > 0) {
    // Create a more secure random password
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$';
    let randomPassword = '';
    
    // Start with first letter of name (lowercase)
    randomPassword += name.charAt(0).toLowerCase();
    
    // Add last 4 digits of PRN if available
    if (its.length >= 4) {
      randomPassword += its.slice(-4);
    }
    
    // Add random characters to make password at least 8 characters long
    while (randomPassword.length < 8) {
      randomPassword += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    setPassword(randomPassword);
  } else {
    setPassword('');
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
    if (!its || !name || !password) {
      setError("Please fill all the fields.");
      setSuccess(null);
      return;
    }
    
    try {
      setLoading(true);
      await setDoc(doc(db, "users", its), {
        name: name,
        password: password
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
        await deleteDoc(doc(db, "users", uid));
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
  }
  
  // Add new function to handle password change
  const handleChangePassword = async (userId) => {
    const newPassword = prompt("Enter new password for user:");
    
    if (!newPassword) {
      setError("Password change cancelled.");
      return;
    }
    
    try {
      setLoading(true);
      await setDoc(doc(db, "users", userId), {
        name: users.find(user => user.id === userId).name,
        password: newPassword
      }, { merge: true });
      
      setSuccess(`Password for ${userId} changed successfully!`);
      setError(null);
      fetchUsers();
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
    <div className="user-management-container">
      <h1 className="page-title">User Management</h1>
      
      {/* Message displays */}
      {error && <div className="error-message show">{error}</div>}
      {success && <div className="success-message show">{success}</div>}
      
      {/* User registration form */}
      <div className="user-form-card">
        <h2>Add New User</h2>
        <div className="user-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              placeholder="Enter user's full name"
              value={name}
              onChange={handleNameChange}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="its">User ID</label>
            <input
              type="text"
              id="its"
              placeholder="Enter user ID"
              value={its}
              onChange={handleITSChange}
              maxLength={8}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-field">
              <input
                type="text"
                id="password"
                placeholder="Password will be generated"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                readOnly={false}
              />
              <button 
                className="generate-btn"
                onClick={() => generatePassword(name, its)}
                title="Generate Password"
              >
                <i className="fas fa-sync-alt"></i>
              </button>
            </div>
          </div>
          
          <button 
            className="btn-primary"
            onClick={() => handleSignUp(its, password, name)}
            disabled={loading}
          >
            {loading ? <LoadingSpinner size="small" color="white" text="" /> : 'Add User'}
          </button>
        </div>
      </div>
      
      {/* User list section */}
      <div className="users-list-card">
        <div className="users-header">
          <h2>Registered Users</h2>
          <div className="users-actions">
            <div className="search-container">
              <input
                type="text"
                placeholder="Search by name or ID..."
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
            <button 
              className="reload-btn" 
              onClick={fetchUsers}
              title="Refresh user list"
            >
              <HiOutlineRefresh />
            </button>
          </div>
        </div>
        
        {loading ? (
          <LoadingSpinner text="Loading users..." />
        ) : (
          <>
            {filteredUsers.length === 0 ? (
              <div className="no-users-message">
                <p>No users found.</p>
              </div>
            ) : (
              <div className="users-table-container">
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>Status</th>
                      <th>Name</th>
                      <th>User ID</th>
                      <th>Password</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(user => (
                      <tr key={user.id} className={onlineStatus[user.id]?.login_status ? 'user-online' : ''}>
                        <td>
                          <span 
                            className="status-indicator" 
                            style={{ 
                              backgroundColor: onlineStatus[user.id]?.login_status ? '#2ecc71' : '#e74c3c' 
                            }}
                            title={onlineStatus[user.id]?.login_status ? 'Online' : 'Offline'}
                          ></span>
                        </td>
                        <td>{user.name}</td>
                        <td>{user.id}</td>
                        <td className="password-cell">
                          <div className="password-container">
                            <span>{user.showPassword ? user.password : '••••••••'}</span>
                            <button 
                              className="password-visibility-toggle" 
                              onClick={() => handleTogglePassword(user.id)}
                              title={user.showPassword ? "Hide password" : "Show password"}
                            >
                              {user.showPassword ? <IoEyeOffOutline /> : <IoEyeOutline />}
                            </button>
                            {/* Add password change button */}
                            <button 
                              className="btn-action btn-change-password" 
                              onClick={() => handleChangePassword(user.id)}
                              title="Change password"
                            >
                              <i className="fas fa-key"></i>
                            </button>
                          </div>
                        </td>
                        <td className="actions-cell">
                          {onlineStatus[user.id]?.login_status && (
                            <button 
                              className="btn-action" 
                              onClick={() => handleSignOut(user.id)}
                              title="Sign out user"
                            >
                              <CgLogOut />
                            </button>
                          )}
                          <button 
                            className="btn-action" 
                            onClick={() => handleDeleteUser(user.id)}
                            title="Delete user"
                          >
                            <RiDeleteBinLine />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
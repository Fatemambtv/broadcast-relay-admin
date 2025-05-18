import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { RiLogoutBoxLine } from 'react-icons/ri';
import '../styles/index.css';
import novaLogo from '../assets/images/green-logo.png'; // Update this path to where you'll store the logo

const Navbar = ({ onLogout }) => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    console.log('Logout clicked', onLogout);
    if (typeof onLogout === 'function') {
      onLogout();
    } else {
      console.error('onLogout is not a function');
    }
  };

  return (
    <nav className="navbar">
      <img src={novaLogo} alt="Nova Cast" className="nav-logo" aria-label="App logo" />
      <div className="nav-links">
        <Link to="/dashboard">
          <button
            className={`nav-button ${isActive('/dashboard') ? 'nav-button-active' : ''}`}
            aria-label="Dashboard"
            aria-current={isActive('/dashboard') ? 'page' : undefined}
          >
            Dashboard
          </button>
        </Link>
        <Link to="/users">
          <button
            className={`nav-button ${isActive('/users') ? 'nav-button-active' : ''}`}
            aria-label="User Management"
            aria-current={isActive('/users') ? 'page' : undefined}
          >
            Users
          </button>
        </Link>
        <Link to="/servers">
          <button
            className={`nav-button ${isActive('/servers') ? 'nav-button-active' : ''}`}
            aria-label="Server Control"
            aria-current={isActive('/servers') ? 'page' : undefined}
          >
            Servers
          </button>
        </Link>
        <Link to="/chats">
          <button
            className={`nav-button ${isActive('/chats') ? 'nav-button-active' : ''}`}
            aria-label="Chat Management"
            aria-current={isActive('/chats') ? 'page' : undefined}
          >
            Chats
          </button>
        </Link>
        <Link to="/settings">
          <button
            className={`nav-button ${isActive('/settings') ? 'nav-button-active' : ''}`}
            aria-label="Settings"
            aria-current={isActive('/settings') ? 'page' : undefined}
          >
            Settings
          </button>
        </Link>
        <button
          className="button button-danger"
          onClick={handleLogout}
          aria-label="Log out"
        >
          <RiLogoutBoxLine size={18} />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
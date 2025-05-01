import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/Navbar.css';

const Navbar = ({ onLogout }) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <img 
          src="https://img.icons8.com/fluency/48/000000/broadcast.png" 
          alt="Broadcast Relay Logo" 
        />
        <span>Broadcast Relay</span>
      </div>
      
      <div className="mobile-menu-toggle" onClick={toggleMobileMenu}>
        <span></span>
        <span></span>
        <span></span>
      </div>
      
      <ul className={`navbar-menu ${isMobileMenuOpen ? 'open' : ''}`}>
        <li className={isActive('/dashboard')}>
          <Link to="/dashboard" onClick={closeMobileMenu}>
            <i className="fas fa-tachometer-alt"></i> Dashboard
          </Link>
        </li>
        <li className={isActive('/users')}>
          <Link to="/users" onClick={closeMobileMenu}>
            <i className="fas fa-users"></i> User Management
          </Link>
        </li>
        <li className={isActive('/servers')}>
          <Link to="/servers" onClick={closeMobileMenu}>
            <i className="fas fa-server"></i> Server Control
          </Link>
        </li>
        <li className={isActive('/settings')}>
          <Link to="/settings" onClick={closeMobileMenu}>
            <i className="fas fa-cog"></i> Settings
          </Link>
        </li>
        <li className="logout-button">
          <button onClick={onLogout}>
            <i className="fas fa-sign-out-alt"></i> Logout
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
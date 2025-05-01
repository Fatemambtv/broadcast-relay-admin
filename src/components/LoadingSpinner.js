import React from 'react';
import '../styles/LoadingSpinner.css';

const LoadingSpinner = ({ size = 'medium', color = 'primary', text = 'Loading...' }) => {
  const sizeClass = `spinner-${size}`;
  const colorClass = `spinner-${color}`;
  
  return (
    <div className="spinner-container">
      <div className={`spinner ${sizeClass} ${colorClass}`}></div>
      {text && <p className="spinner-text">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
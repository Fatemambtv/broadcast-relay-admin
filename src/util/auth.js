// Authentication utility functions

/*
 * Store authentication data in localStorage
 * @param {Object} userData - User data to store
 */
export const setAuthData = (userData) => {
  localStorage.setItem('authData', JSON.stringify({
    ...userData,
    timestamp: new Date().getTime()
  }));
};

/*
 * Get authentication data from localStorage
 * @returns {Object|null} User data or null if not authenticated
 */
export const getAuthData = () => {
  const authData = localStorage.getItem('authData');
  
  if (!authData) {
    return null;
  }
  
  try {
    const parsedData = JSON.parse(authData);
    
    // Check if the auth data is expired (24 hours)
    const now = new Date().getTime();
    const authTime = parsedData.timestamp || 0;
    const authAgeHours = (now - authTime) / (1000 * 60 * 60);
    
    if (authAgeHours > 24) {
      clearAuthData();
      return null;
    }
    
    return parsedData;
  } catch (error) {
    console.error('Error parsing auth data:', error);
    clearAuthData();
    return null;
  }
};

/*
 * Clear authentication data from localStorage
 */
export const clearAuthData = () => {
  localStorage.removeItem('authData');
};

/*
 * Check if the user is authenticated
 * @returns {boolean} True if authenticated, false otherwise
 */
export const isAuthenticated = () => {
  return getAuthData() !== null;
};

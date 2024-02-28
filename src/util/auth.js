// auth.js
export const setAuthData = (user) => {
    localStorage.setItem("authUser", user);
};

export const getAuthData = () => {
    const authUser = localStorage.getItem("authUser");
    return authUser;
};

export const clearAuthData = () => {
    localStorage.removeItem("authUser");
};

// Add the following functions
export const setStoredUsername = (username) => {
    localStorage.setItem("username", username);
};

export const getStoredUsername = () => {
    return localStorage.getItem("username");
};

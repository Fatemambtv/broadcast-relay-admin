// auth.js
export const setAuthData = (user) => {
    localStorage.setItem("authAdmin", user);
};

export const getAuthData = () => {
    const authUser = localStorage.getItem("authAdmin");
    return authUser;
};

export const clearAuthData = () => {
    localStorage.removeItem("authAdmin");
};

// Add the following functions
export const setStoredUsername = (username) => {
    localStorage.setItem("username", username);
};

export const getStoredUsername = () => {
    return localStorage.getItem("username");
};

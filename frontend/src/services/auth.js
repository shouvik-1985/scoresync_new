// src/services/auth.js

const TOKEN_KEY = 'id_token';
const USER_KEY = 'user_data';

// Save ID Token and user info
export function saveAuthData(idToken, userData) {
    localStorage.setItem(TOKEN_KEY, idToken);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
}

// Get ID Token
export function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

// Get User Info
export function getUser() {
    const userJson = localStorage.getItem(USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
}

// Logout User
export function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
}

// src/services/axiosInstance.js

import axios from 'axios';
import API_BASE_URL from '../config';
import { getToken } from './auth';

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
});

const publicAxios = axios.create({
    baseURL: API_BASE_URL,
});

// Attach token automatically
axiosInstance.interceptors.request.use((config) => {
    const token = getToken();
    console.log('Token:', token); // Log the token to the console
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});



export { publicAxios }; 
export default axiosInstance;

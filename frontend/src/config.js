// src/config.js

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://score-sync-backend.onrender.com/api'
  : 'http://127.0.0.1:8000/api';

export default API_BASE_URL;

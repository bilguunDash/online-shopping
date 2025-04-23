// pages/utils.js
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8083/api/auth',
    headers: { 'Content-Type': 'application/json' }
});

// JWT Token Handling
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('jwt');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`; // Fixed template literal syntax
    }
    return config;
});

export default api;
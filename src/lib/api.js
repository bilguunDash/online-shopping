// src/lib/api.js
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8083', 
    headers: { 'Content-Type': 'application/json' },
});

// Add JWT token to headers
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('jwt');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;


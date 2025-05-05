// pages/utils.js
import axios from 'axios';

// API базын хаяг
const BASE_URL = 'http://localhost:8083';
const AUTH_URL = `${BASE_URL}/api/auth`;

// API instance
const api = axios.create({
    baseURL: BASE_URL,
    headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    timeout: 15000 // 15 секундын timeout
});

// API endpoints
export const API_ENDPOINTS = {
    // Auth endpoints (api/auth prefix)
    auth: {
        register: '/api/auth/register',
        login: '/api/auth/login',
    },
    // Admin endpoints (admin prefix)
    admin: {
        all: '/admin/admin-all',
        delete: (id) => `/admin/admin-delete/${id}`,
        register: '/admin/register-admin'
    },
    // User endpoints
    user: {
        all: '/admin/user-all',
        delete: (id) => `/admin/user-delete/${id}`
    }
};

// Create a second instance specifically for auth calls
export const authApi = axios.create({
    baseURL: AUTH_URL,
    headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    timeout: 15000 // 15 секундын timeout
});

// Direct API calls without axios for testing
export const directApiCall = async (endpoint, method = 'GET', data = null) => {
    const url = `${BASE_URL}${endpoint}`;
    console.log(`Direct API call: ${method} ${url}`);
    
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json'
        }
    };
    
    if (data) {
        options.body = JSON.stringify(data);
    }
    
    const token = localStorage.getItem('jwt');
    if (token) {
        options.headers.Authorization = `Bearer ${token}`;
    }
    
    try {
        const response = await fetch(url, options);
        console.log(`API response status: ${response.status}`);
        
        let responseData;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            responseData = await response.json();
        } else {
            responseData = await response.text();
        }
        
        if (!response.ok) {
            throw {
                status: response.status,
                data: responseData,
                message: response.statusText
            };
        }
        
        return responseData;
    } catch (error) {
        console.error('Direct API call error:', error);
        throw error;
    }
};

// JWT Token Handling
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('jwt');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error);
        
        // Network error
        if (!error.response) {
            console.error('Network Error:', error.message);
        }
        
        return Promise.reject(error);
    }
);

// Same for authApi
authApi.interceptors.request.use((config) => {
    const token = localStorage.getItem('jwt');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

authApi.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('Auth API Error:', error);
        
        // Network error
        if (!error.response) {
            console.error('Network Error:', error.message);
        }
        
        return Promise.reject(error);
    }
);

export default api;
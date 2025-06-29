// pages/utils/axios.js
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

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
        refresh: '/api/auth/refresh-token',
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
        delete: (id) => `/admin/user-delete/${id}`,
        update: '/admin/update-users-account'
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

// JWT token decode function
export const decodeToken = (token) => {
  try {
    if (!token) return null;
    
    // Remove 'Bearer ' prefix if it exists
    const cleanToken = token.startsWith('Bearer ') ? token.slice(7) : token;
    
    // Decode the token
    const decodedToken = jwtDecode(cleanToken);
    
    // Extract user information
    const firstName = decodedToken.firstName || decodedToken.sub || '';
    const lastName = decodedToken.lastName || '';
    
    // Extract role - handle different token formats
    let role = 'USER'; // Default role
    
    if (decodedToken.role) {
      // Handle role as array with authority property (from API response)
      if (Array.isArray(decodedToken.role) && decodedToken.role.length > 0 && decodedToken.role[0].authority) {
        const authority = decodedToken.role[0].authority;
        // Convert "ROLE_USER" to "USER" by removing the "ROLE_" prefix
        role = authority.startsWith('ROLE_') ? authority.substring(5) : authority;
      } 
      // Handle role as direct string
      else if (typeof decodedToken.role === 'string') {
        role = decodedToken.role;
      }
    } else if (decodedToken.authorities) {
      role = decodedToken.authorities;
    }
    
    console.log('Decoded token data:', { firstName, lastName, role, decodedToken });
    
    // Store the extracted data in localStorage
    localStorage.setItem('firstName', firstName);
    localStorage.setItem('lastName', lastName);
    localStorage.setItem('role', role);
    
    return { firstName, lastName, role };
  } catch (error) {
    console.error('Error decoding token:', error);
    
    // Clear stored user data in case of invalid token
    localStorage.removeItem('firstName');
    localStorage.removeItem('lastName');
    localStorage.removeItem('role');
    
    return null;
  }
};

// Token refresh - to avoid infinite loops
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Refresh token function
const refreshToken = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await axios.post(`${BASE_URL}${API_ENDPOINTS.auth.refresh}`, { token: refreshToken });
    
    const { accessToken, refreshToken: newRefreshToken } = response.data;
    
    if (accessToken) {
      localStorage.setItem('jwt', accessToken);
      if (newRefreshToken) {
        localStorage.setItem('refreshToken', newRefreshToken);
      }
      return accessToken;
    } else {
      throw new Error('No access token received');
    }
  } catch (error) {
    console.error('Error refreshing token:', error);
    // Clear tokens and redirect to login
    localStorage.removeItem('jwt');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('firstName');
    localStorage.removeItem('lastName');
    localStorage.removeItem('role');
    
    window.location.href = '/login';
    throw error;
  }
};

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
        // Add token validation here if needed
        try {
            // Get user role if available
            const role = localStorage.getItem('role');
            console.log('Current user role:', role);
            
            // Always use standard Bearer token format for all users
            config.headers.Authorization = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
            
            // For debugging - log what format we're using
            console.log('Auth header format used:', config.headers.Authorization);
            
            // Decode token and extract user information
            decodeToken(token);
        } catch (error) {
            console.error('Error setting auth header:', error);
            // Clear invalid token
            localStorage.removeItem('jwt');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('firstName');
            localStorage.removeItem('lastName');
            localStorage.removeItem('role');
            
            // Dispatch auth error event
            window.dispatchEvent(new CustomEvent('authError', {
                detail: { 
                    status: 401,
                    message: 'Invalid authentication token. Please log in again.',
                    isCartOperation: config.url?.includes('/cart') || false
                }
            }));
        }
    } else {
        console.log('No JWT token found in localStorage');
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        // Network error
        if (!error.response) {
            console.error('Network Error:', error.message);
            return Promise.reject(error);
        }
        
        // Authentication error - Try to refresh token
        if (error.response.status === 401 && !originalRequest._retry && localStorage.getItem('refreshToken')) {
            if (isRefreshing) {
                try {
                    // Wait for the token to be refreshed
                    const token = await new Promise((resolve, reject) => {
                        failedQueue.push({ resolve, reject });
                    });
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                } catch (err) {
                    return Promise.reject(err);
                }
            }
            
            originalRequest._retry = true;
            isRefreshing = true;
            
            try {
                const token = await refreshToken();
                processQueue(null, token);
                
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }
        
        // Other Authentication errors (403)
        if (error.response && (error.response.status === 403)) {
            console.error('Authentication Error:', error.response.status);
            
            // Clear all auth data from localStorage
            localStorage.removeItem('jwt');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('firstName');
            localStorage.removeItem('lastName');
            localStorage.removeItem('role');
            
            // For 403 errors related to cart operations, we won't redirect, just provide feedback
            const isCartOperation = error.config.url.includes('/cart');
            
            // Don't redirect for cart operations, but do dispatch auth error event
            window.dispatchEvent(new CustomEvent('authError', {
                detail: { 
                    status: error.response.status, 
                    message: 'Your session has expired. Please log in again.',
                    isCartOperation: isCartOperation
                }
            }));
            
            // If not a cart operation and not already on login page, redirect
            if (!isCartOperation && window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
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
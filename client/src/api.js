import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:3000',
});

// 1. Request Interceptor: Attaches token to every outgoing request
API.interceptors.request.use((req) => {
    const token = localStorage.getItem('token');
    if (token) {
        req.headers.token = token;
    }
    return req;
});

// 2. Response Interceptor: Catches 401/403 errors globally
API.interceptors.response.use(
    (response) => response, // If success, just return response
    (error) => {
        // If Backend says "Unauthorized" (401) or "Forbidden" (403)
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            
            // Only redirect if we are not already on the auth page (prevents loops)
            if (window.location.pathname !== '/auth') {
                localStorage.clear(); // Wipe bad credentials
                window.location.href = '/auth'; // Hard redirect to login
            }
        }
        return Promise.reject(error);
    }
);

export default API;
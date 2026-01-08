import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:3000', // Ensure this matches your backend port
});

// 1. Interceptor to add Token to every request
API.interceptors.request.use((req) => {
    if (localStorage.getItem('token')) {
        req.headers.token = localStorage.getItem('token');
    }
    return req;
});

// 2. 👇 NEW: Interceptor to handle Expired Tokens automatically
API.interceptors.response.use(
    (response) => response, // Return success responses as is
    (error) => {
        // If the backend says "Unauthorized" (401) or "Forbidden" (403)
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            
            // Clear the bad token
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            
            // Redirect to Auth page
            window.location.href = '/auth';
        }
        return Promise.reject(error);
    }
);

export default API;
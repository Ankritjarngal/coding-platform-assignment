import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:3000', 
});

API.interceptors.request.use((req) => {
    if (localStorage.getItem('token')) {
        req.headers.token = localStorage.getItem('token');
    }
    return req;
});

API.interceptors.response.use(
    (response) => response, 
    (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {

            localStorage.removeItem('token');
            localStorage.removeItem('role');
            
            window.location.href = '/auth';
        }
        return Promise.reject(error);
    }
);

export default API;
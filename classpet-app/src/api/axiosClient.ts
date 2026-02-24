import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
    withCredentials: false,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Add a request interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('ACCESS_TOKEN');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;

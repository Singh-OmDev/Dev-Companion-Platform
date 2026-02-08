import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request Interceptor: Attach Token from Clerk
api.interceptors.request.use(
    async (config) => {
        // Attempt to get token from global Clerk instance if available
        if (window.Clerk && window.Clerk.session) {
            const token = await window.Clerk.session.getToken();
            if (token) {
                config.headers['Authorization'] = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor: Handle 401s
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            console.error('Session expired or unauthorized.');
            // Clerk handles redirection automatically usually, but we can force it if needed
            // window.location.href = '/login'; 
        }
        return Promise.reject(error);
    }
);

export default api;

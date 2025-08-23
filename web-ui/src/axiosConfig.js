import axios from 'axios';

const API_HOST = process.env.REACT_APP_API_HOST;

const axiosInstance = axios.create({
    baseURL: API_HOST,
    // Ensures cookies, including XSRF-TOKEN, are sent
    withCredentials: true,
    xsrfCookieName: 'XSRF-TOKEN',
    xsrfHeaderName: 'X-XSRF-TOKEN'
});

axiosInstance.interceptors.request.use((config) => {
    const jwtToken = sessionStorage.getItem('jwtToken');
    if (jwtToken) {
        try {
            // Check if token is expired before adding it to request
            const payload = JSON.parse(atob(jwtToken.split('.')[1]));
            if (payload.exp > Date.now() / 1000) {
                config.headers['Authorization'] = "Bearer " + jwtToken;
            } else {
                // Token is expired, remove it
                sessionStorage.removeItem('jwtToken');
                sessionStorage.removeItem('userData');
                sessionStorage.removeItem('csrfToken');
            }
        } catch (error) {
            // Invalid token, remove it
            sessionStorage.removeItem('jwtToken');
            sessionStorage.removeItem('userData');
            sessionStorage.removeItem('csrfToken');
        }
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Response interceptor to handle JWT expiration errors
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 403 && error.response?.data?.includes?.('JWT expired')) {
            // JWT expired, clear all auth data
            sessionStorage.removeItem('jwtToken');
            sessionStorage.removeItem('userData');
            sessionStorage.removeItem('csrfToken');
            // Optionally redirect to login page
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const fetchCsrfToken = async () => {
    await axiosInstance.get('/api/user/csrf');
};


export default axiosInstance;

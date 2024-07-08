import axios from 'axios';

const API_HOST = process.env.REACT_APP_API_HOST;

const axiosInstance = axios.create({
    baseURL: API_HOST,
    withCredentials: true,
});

axiosInstance.interceptors.request.use((config) => {
    const csrfToken = sessionStorage.getItem('csrfToken');
    if (csrfToken) {
        config.headers['X-CSRF-Token'] = csrfToken;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default axiosInstance;

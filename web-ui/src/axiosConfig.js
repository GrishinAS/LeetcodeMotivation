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
        config.headers['Authorization'] = "Bearer " + jwtToken;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export const fetchCsrfToken = async () => {
    await axiosInstance.get('/api/user/csrf');
};


export default axiosInstance;

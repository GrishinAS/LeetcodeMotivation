import axios from 'axios';
import { createMockAxios } from './services/mockApi';

const API_HOST = process.env.REACT_APP_API_HOST;
const USE_MOCK_API = process.env.REACT_APP_USE_MOCK_API === 'true';

const createAxiosInstance = () => {
    if (USE_MOCK_API) {
        console.log('[CONFIG] Using Mock API for development');
        return createMockAxios();
    }

    console.log('[CONFIG] Using Real API:', API_HOST);
    return axios.create({ baseURL: API_HOST });
};

const axiosInstance = createAxiosInstance();

if (!USE_MOCK_API) {
    // Attach JWT from localStorage to every request
    axiosInstance.interceptors.request.use(config => {
        const token = localStorage.getItem('jwt');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    });

    axiosInstance.interceptors.response.use(
        response => response,
        error => {
            if (error.response?.status === 401 || error.response?.status === 403) {
                localStorage.removeItem('jwt');
                sessionStorage.removeItem('userData');
                const allowedPaths = ['/login', '/signup', '/'];
                if (!allowedPaths.includes(window.location.pathname)) {
                    setTimeout(() => {
                        alert('Session expired. Please log in again.');
                        window.location.href = '/login';
                    }, 100);
                }
            }
            return Promise.reject(error);
        }
    );
}

export default axiosInstance;

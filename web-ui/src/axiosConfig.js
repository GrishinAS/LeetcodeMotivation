import axios from 'axios';
import { createMockAxios } from './services/mockApi';

const API_HOST = process.env.REACT_APP_API_HOST;
const USE_MOCK_API = process.env.REACT_APP_USE_MOCK_API === 'true';
const IS_DEVELOPMENT = process.env.REACT_APP_ENV === 'development';

console.log('Environment Config:', {
  API_HOST,
  USE_MOCK_API,
  IS_DEVELOPMENT,
  NODE_ENV: process.env.NODE_ENV
});

const createAxiosInstance = () => {
    if (USE_MOCK_API) {
        console.log('[CONFIG] Using Mock API for development');
        return createMockAxios();
    }

    console.log('[CONFIG] Using Real API:', API_HOST);
    return axios.create({
        baseURL: API_HOST,
        withCredentials: true
    });
};

const axiosInstance = createAxiosInstance();

if (!USE_MOCK_API) {
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
                }
            } catch (error) {
                // Invalid token, remove it
                sessionStorage.removeItem('jwtToken');
                sessionStorage.removeItem('userData');
            }
        }
        return config;
    }, (error) => {
        return Promise.reject(error);
    });
}

if (!USE_MOCK_API) {
    axiosInstance.interceptors.response.use(
        (response) => response,
        (error) => {
            console.log('Axios interceptor caught error:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message,
                fullError: error
            });

            const errorData = error.response?.data || '';
            const errorMessage = typeof errorData === 'string' ? errorData : JSON.stringify(errorData);

            console.warn('JWT authentication failed, redirecting to login:', {
                errorData: error.response?.data
            });

            sessionStorage.removeItem('jwtToken');
            sessionStorage.removeItem('userData');

            if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
                const userMessage = errorMessage.includes('JWT signature does not match')
                    ? 'User token has expired. Please log in again.'
                    : 'Forbidden.';

                setTimeout(() => {
                    alert(userMessage);
                    window.location.href = '/login';
                }, 100);
            }
            
            return Promise.reject(error);
        }
    );
}


export default axiosInstance;

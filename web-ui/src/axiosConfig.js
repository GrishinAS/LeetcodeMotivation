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

            sessionStorage.removeItem('userData');

            if (window.location.pathname !== '/login' && window.location.pathname !== '/signup' && window.location.pathname !== '/') {

                setTimeout(() => {
                    alert("Auth issue: " + errorMessage);
                    window.location.href = '/login';
                }, 100);
            }
            
            return Promise.reject(error);
        }
    );
}


export default axiosInstance;

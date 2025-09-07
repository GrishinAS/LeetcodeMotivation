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

// Create axios instance based on environment
const createAxiosInstance = () => {
    if (USE_MOCK_API) {
        console.log('[CONFIG] Using Mock API for development');
        return createMockAxios();
    }

    console.log('[CONFIG] Using Real API:', API_HOST);
    return axios.create({
        baseURL: API_HOST,
        // Ensures cookies, including XSRF-TOKEN, are sent
        withCredentials: true,
        xsrfCookieName: 'XSRF-TOKEN',
        xsrfHeaderName: 'X-XSRF-TOKEN'
    });
};

const axiosInstance = createAxiosInstance();

// Only add interceptors for real API
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
}

// Only add response interceptor for real API
if (!USE_MOCK_API) {
    // Response interceptor to handle JWT errors
    axiosInstance.interceptors.response.use(
        (response) => response,
        (error) => {
            console.log('Axios interceptor caught error:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message,
                fullError: error
            });

            // Check for various JWT-related errors - be more flexible with data type checking
            const errorData = error.response?.data || '';
            const errorMessage = typeof errorData === 'string' ? errorData : JSON.stringify(errorData);
            
            const isJWTError = error.response?.status === 403 && (
                errorMessage.includes('JWT expired') ||
                errorMessage.includes('JWT signature does not match') ||
                errorMessage.includes('JWT validity cannot be asserted') ||
                errorMessage.includes('Access denied')
            );
            
            const isCSRFError = error.response?.status === 403 && (
                errorMessage.includes('CSRF') ||
                errorMessage.includes('Invalid CSRF token')
            );

            // Also check for generic 401 Unauthorized or any 403 with JWT token present
            const isUnauthorized = error.response?.status === 401;
            const isForbiddenWithJWT = error.response?.status === 403 && sessionStorage.getItem('jwtToken');

            // Only redirect to login for JWT-related errors, not CSRF errors
            if ((isJWTError || isUnauthorized || isForbiddenWithJWT) && !isCSRFError) {
                console.warn('JWT authentication failed, redirecting to login:', {
                    isJWTError,
                    isUnauthorized,
                    isForbiddenWithJWT,
                    errorData: error.response?.data
                });
                
                // Clear all auth data
                sessionStorage.removeItem('jwtToken');
                sessionStorage.removeItem('userData');
                sessionStorage.removeItem('csrfToken');
                
                // Show a user-friendly message before redirect
                if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
                    // Only show alert if not already on login/signup page
                    const userMessage = errorMessage.includes('JWT signature does not match') 
                        ? 'Server was restarted. Please log in again.'
                        : 'Your session has expired. Please log in again.';
                    
                    setTimeout(() => {
                        alert(userMessage);
                        window.location.href = '/login';
                    }, 100);
                }
            }
            
            return Promise.reject(error);
        }
    );
}

export const fetchCsrfToken = async () => {
    console.log('Fetching fresh CSRF token...');
    try {
        await axiosInstance.get('/api/user/csrf');
        console.log('CSRF token refreshed successfully');
    } catch (error) {
        console.error('Failed to fetch CSRF token:', error);
        throw error;
    }
};

// Global function to retry requests with fresh CSRF token
export const retryWithFreshCsrf = async (requestFunction) => {
    try {
        return await requestFunction();
    } catch (error) {
        if (error.response?.status === 403 && 
            (error.response?.data?.includes?.('CSRF') || 
             error.message?.includes?.('CSRF') ||
             error.response?.statusText === 'Forbidden')) {
            
            console.log('CSRF error detected, refreshing token and retrying...');
            await fetchCsrfToken();
            return await requestFunction();
        }
        throw error;
    }
};


export default axiosInstance;

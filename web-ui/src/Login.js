import React, { useState, useEffect } from 'react';
import axios, { fetchCsrfToken } from './axiosConfig';
import './Login.css';

const API_HOST = process.env.REACT_APP_API_HOST;

const Login = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    // Clear any existing auth data when component mounts
    useEffect(() => {
        sessionStorage.removeItem('jwtToken');
        sessionStorage.removeItem('userData');
        sessionStorage.removeItem('csrfToken');
    }, []);

    const handleLogin = async () => {
        try {
            // Clear any existing auth data before attempting login
            sessionStorage.removeItem('jwtToken');
            sessionStorage.removeItem('userData');
            sessionStorage.removeItem('csrfToken');
            
            setError('');
            await fetchCsrfToken();

            const response = await axios.post(`${API_HOST}/api/user/login`, { email, password });
            const { jwtToken, ...userData } = response.data;
            sessionStorage.setItem('jwtToken', jwtToken);
            sessionStorage.setItem('userData', JSON.stringify(userData));
            
            // Fetch a fresh CSRF token after successful login to ensure subsequent requests work
            try {
                await fetchCsrfToken();
                console.log('Fresh CSRF token obtained after login');
            } catch (csrfErr) {
                console.warn('Failed to obtain fresh CSRF token after login:', csrfErr);
                // Don't fail the login process, but log the warning
            }
            
            onLogin(response.data);
        } catch (err) {
            console.error('Login error:', err);
            setError('Login failed. Please try again.');
        }
    };

    return (
        <div className="login-container">
            <h1>Login</h1>
            <input
                type="text"
                className="login-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
            />
            <input
                type="password"
                className="login-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
            />
            <button className="login-button" onClick={handleLogin}>Login</button>
            {error && <p className="error">{error}</p>}
        </div>
    );
};

export default Login;

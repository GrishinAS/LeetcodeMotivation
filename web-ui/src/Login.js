import React, { useState, useEffect } from 'react';
import axios from './axiosConfig';
import './Login.css';

const API_HOST = process.env.REACT_APP_API_HOST;

const Login = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        sessionStorage.removeItem('userData');
        localStorage.removeItem('jwt');
    }, []);

    const handleLogin = async () => {
        try {
            setError('');
            const response = await axios.post(`${API_HOST}/api/user/login`, { email, password });
            const { token, ...userData } = response.data;
            localStorage.setItem('jwt', token);
            sessionStorage.setItem('userData', JSON.stringify(userData));
            onLogin(userData);
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

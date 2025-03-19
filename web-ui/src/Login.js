import React, { useState } from 'react';
import axios, { fetchCsrfToken } from './axiosConfig';
import './Login.css';

const API_HOST = process.env.REACT_APP_API_HOST;

const Login = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async () => {
        try {
            await fetchCsrfToken();

            const response = await axios.post(`${API_HOST}/api/user/login`, { email, password });
            const jwtToken = response.data.jwtToken
            sessionStorage.setItem('jwtToken', jwtToken);
            onLogin(response.data);
        } catch (err) {
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

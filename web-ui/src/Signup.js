import React, { useState } from 'react';
import axios from './axiosConfig';
import { useNavigate } from 'react-router-dom';
import './Signup.css';

const Signup = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [leetcodeAccount, setLeetcodeAccount] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleSignup = async () => {
        try {
            await axios.post('/api/user/signup', { username, email, leetcodeAccount, password });
            setSuccess('Signup successful! Redirecting to login...');
            setError('');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            setError('Signup failed. Please try again.');
            setSuccess('');
        }
    };

    return (
        <div className="signup-container">
            <h1>Signup</h1>
            <input
                type="text"
                className="signup-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
            />
            <input
                type="email"
                className="signup-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
            />
            <input
                type="text"
                className="signup-input"
                value={leetcodeAccount}
                onChange={(e) => {
                    const value = e.target.value;
                    const cleanValue = value.includes('@') ? value.split('@')[0] : value;
                    setLeetcodeAccount(cleanValue)}
                }
                placeholder="LeetCode Account"
            />
            <input
                type="password"
                className="signup-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
            />
            <button className="signup-button" onClick={handleSignup}>Signup</button>
            {error && <p className="error">{error}</p>}
            {success && <p className="success">{success}</p>}
        </div>
    );
};

export default Signup;

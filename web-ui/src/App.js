import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import Home from './Home';
import Login from './Login';
import Signup from './Signup';
import Redeem from './Redeem';
import './App.css';
import axios from "./axiosConfig";

const App = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuthStatus = async () => {
            const userData = sessionStorage.getItem('userData');

            if (userData) {
                try {
                    const response = await axios.get(`/api/user/me`);

                    const parsedUserData = response.data;
                    setUser(parsedUserData);

                    sessionStorage.setItem('userData', JSON.stringify(parsedUserData));
                } catch (error) {
                    console.error('Session validation failed:', error);
                    sessionStorage.removeItem('userData');
                    setUser(null);
                }
            } else {
                // No userData stored, try to get current user from session
                try {
                    const response = await axios.get(`/api/user/me`);

                    const parsedUserData = response.data;
                    setUser(parsedUserData);
                    sessionStorage.setItem('userData', JSON.stringify(parsedUserData));
                } catch (error) {
                    setUser(null);
                }
            }
            setLoading(false);
        };

        checkAuthStatus().catch(err => console.error(err));
    }, []);

    const handleLogin = (userData) => {
        setUser(userData);
        sessionStorage.setItem('userData', JSON.stringify(userData));
    };

    const handleLogout = async () => {
        try {
            await axios.post(`/api/user/logout`, {});
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
            sessionStorage.removeItem('userData');
        }
    };

    useEffect(() => {
        const checkAuthStatus = async () => {
            if (user) {
                try {
                    await axios.get(`/api/user/me`);
                } catch (error) {
                    setUser(null);
                    sessionStorage.removeItem('userData');
                }
            }
        };

        const authChecker = setInterval(checkAuthStatus, 5 * 60 * 1000);

        return () => {
            clearInterval(authChecker);
        };
    }, [user]);

    if (loading) {
        return (
            <div className="App">
                <div className="welcome-container">
                    <h1>Loading...</h1>
                </div>
            </div>
        );
    }
  return (
      <Router>
          <div className="App">
              <Routes>
                  <Route path="/" element={user ? <Home username={user.username} onLogout={handleLogout} /> : (
                      <div className="welcome-container">
                          <h1>Welcome to LeetCode Tracker</h1>
                          <p>Please login or signup to track your progress and redeem rewards.</p>
                          <div className="navigation">
                              <Link to="/login" className="button">Login</Link>
                              <Link to="/signup" className="button">Signup</Link>
                          </div>
                      </div>
                  )}/>
                  <Route path="/login" element={user ? <Navigate to="/"/> : <Login onLogin={handleLogin}/>}/>
                  <Route path="/signup" element= {user ? <Navigate to="/" /> : <Signup />} />
                  <Route path="/redeem" element={user ? <Redeem username={user.username} /> : <Navigate to="/login" />} />
              </Routes>
          </div>
      </Router>

  );
};

export default App;

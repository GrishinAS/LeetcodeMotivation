import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import Home from './Home';
import Login from './Login';
import Signup from './Signup';
import Redeem from './Redeem';
import './App.css';

const App = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuthStatus = () => {
            const jwtToken = sessionStorage.getItem('jwtToken');
            const userData = sessionStorage.getItem('userData');
            
            if (jwtToken && userData) {
                try {
                    // Decode JWT token to check expiration
                    const payload = JSON.parse(atob(jwtToken.split('.')[1]));
                    if (payload.exp > Date.now() / 1000) {
                        // Token is valid, restore user data
                        const parsedUserData = JSON.parse(userData);
                        setUser(parsedUserData);
                    } else {
                        // Token expired, remove all auth data
                        sessionStorage.removeItem('jwtToken');
                        sessionStorage.removeItem('userData');
                        sessionStorage.removeItem('csrfToken');
                    }
                } catch (error) {
                    // Invalid token or userData, remove all auth data
                    sessionStorage.removeItem('jwtToken');
                    sessionStorage.removeItem('userData');
                    sessionStorage.removeItem('csrfToken');
                }
            }
            setLoading(false);
        };

        checkAuthStatus();
    }, []);

    const handleLogin = (userData) => {
        setUser(userData);
    };

    const handleLogout = () => {
        setUser(null);
        sessionStorage.removeItem('jwtToken');
        sessionStorage.removeItem('userData');
        sessionStorage.removeItem('csrfToken');
    };

    // Add a window event listener for auth failures from axios interceptor
    useEffect(() => {
        const handleStorageChange = (e) => {
            // If JWT token is removed (by axios interceptor), update user state
            if (e.key === 'jwtToken' && e.newValue === null) {
                setUser(null);
            }
        };

        // Also check if sessionStorage was cleared by axios interceptor
        const checkAuthStatus = () => {
            if (user && !sessionStorage.getItem('jwtToken')) {
                setUser(null);
            }
        };

        // Check every 5 seconds if user state is out of sync
        const authChecker = setInterval(checkAuthStatus, 20000);
        
        window.addEventListener('storage', handleStorageChange);
        
        return () => {
            window.removeEventListener('storage', handleStorageChange);
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

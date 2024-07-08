import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import Home from './Home';
import Login from './Login';
import Signup from './Signup';
import './App.css';

const App = () => {
    const [user, setUser] = useState(null);

    const handleLogin = (userData) => {
        setUser(userData);
    };

    const handleLogout = () => {
        setUser(null);
        sessionStorage.removeItem('csrfToken');
    };
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
              </Routes>
          </div>
      </Router>

  );
};

export default App;

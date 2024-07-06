import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_HOST = process.env.REACT_APP_API_HOST;
const EASY_COST = process.env.REACT_APP_EASY_TASK_POINTS;
const MEDIUM_COST = process.env.REACT_APP_MEDIUM_TASK_POINTS;
const HARD_COST = process.env.REACT_APP_HARD_TASK_POINTS;

const App = () => {
  const [username, setUsername] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [stats, setStats] = useState(null);
  const [lastLogin, setLastLogin] = useState(null);
  const [previousStats, setPreviousStats] = useState(null);

  const login = async () => {
    try {
      const response = await axios.get(`${API_HOST}/api/user/login`, { username });
      setLastLogin(response.data.lastLogin);
      setLoggedIn(true);
    } catch (error) {
      console.error('Error logging in:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_HOST}/api/leetcode/stats?username=${username}`);
      setPreviousStats(response.data.oldStat); // Store previous stats before updating todo figure out logic
      setStats(response.data.newStat);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const redeemRewards = async () => {
    try {
      const response = await axios.post(`${API_HOST}/api/leetcode/redeem`, { username });
      console.log('Rewards redeemed:', response.data);
    } catch (error) {
      console.error('Error redeeming rewards:', error);
    }
  };

  const calculateTotalPoints = () => {
    if (!stats) return 0;
    const { solvedEasy, solvedMedium, solvedHard } = stats;
    const easyPoints = solvedEasy * EASY_COST;
    const mediumPoints = solvedMedium * MEDIUM_COST;
    const hardPoints = solvedHard * HARD_COST;
    return easyPoints + mediumPoints + hardPoints;
  };

  useEffect(() => {
    if (loggedIn) {
      fetchStats();
    }
  }, [loggedIn]);

  return (
      <div className="App">
        <h1>LeetCode Rewards</h1>
        {!loggedIn ? (
            <div className="login-container">
              <input
                  type="text"
                  placeholder="Enter Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="login-input"
              />
              <button onClick={login} className="login-button">Login</button>
            </div>
        ) : (
            <div className="stats-container">
              <h2>Welcome, {username}</h2>
              <p>Last login: {new Date(lastLogin).toLocaleString()}</p>
              {stats && previousStats && (
                  <div className="stats">
                    <h3>Statistics</h3>
                    <div className="stat-item">
                      <p>Before:</p>
                      <p>Easy: {previousStats.solvedEasy}</p>
                      <p>Medium: {previousStats.solvedMedium}</p>
                      <p>Hard: {previousStats.solvedHard}</p>
                    </div>
                    <div className="stat-item">
                      <p>New:</p>
                      <p>Easy: {stats.solvedEasy}</p>
                      <p>Medium: {stats.solvedMedium}</p>
                      <p>Hard: {stats.solvedHard}</p>
                    </div>
                    <div className="stat-item">
                      <p>Difference:</p>
                      <p>Easy: {stats.solvedEasy - previousStats.solvedEasy}</p>
                      <p>Medium: {stats.solvedMedium - previousStats.solvedMedium}</p>
                      <p>Hard: {stats.solvedHard - previousStats.solvedHard}</p>
                    </div>
                    <div className="stat-item">
                      <p>Total Points:</p>
                      <p style={{ color: '#28a745' }}>Easy Points cost: {EASY_COST}</p>
                      <p style={{ color: '#ffd500' }}>Medium Points cost: {MEDIUM_COST}</p>
                      <p style={{ color: '#dc3545' }}>Hard Points cost: {HARD_COST}</p>
                      <p>Total Points Value: {calculateTotalPoints()}</p>
                    </div>
                  </div>
                  )}
              <button onClick={redeemRewards} className="redeem-button">Redeem Rewards</button>
            </div>
        )}
      </div>
  );
};

export default App;

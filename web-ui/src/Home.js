import React, {useEffect, useState} from 'react';
import axios from './axiosConfig';
import './Home.css';

const EASY_COST = process.env.REACT_APP_EASY_TASK_POINTS;
const MEDIUM_COST = process.env.REACT_APP_MEDIUM_TASK_POINTS;
const HARD_COST = process.env.REACT_APP_HARD_TASK_POINTS;

const Home = ({ username, onLogout }) => {
    const [stats, setStats] = useState(null);
    const [previousStats, setPreviousStats] = useState(null);
    const [lastLogin, setLastLogin] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axios.get('/api/user/stats', { params: { username } });
                setStats(response.data.newStats);
                setPreviousStats(response.data.previousStats);
                setLastLogin(response.data.lastLogin);
            } catch (err) {
                setError('Failed to fetch stats.');
            }
        };
        fetchStats();
    }, [username]);

    const redeemRewards = async () => {
        try {
            await axios.post('/api/user/redeem', { username });
            alert('Rewards redeemed successfully!');
        } catch (err) {
            setError('Failed to redeem rewards.');
        }
    };

    const calculateTotalPoints = () => {
        if (!stats) return 0;
        const {solvedEasy, solvedMedium, solvedHard} = stats;
        const easyPoints = solvedEasy * EASY_COST;
        const mediumPoints = solvedMedium * MEDIUM_COST;
        const hardPoints = solvedHard * HARD_COST;
        return easyPoints + mediumPoints + hardPoints;
    };

    return (
        <div className="home-container">
            <h1>LeetCode Rewards</h1>
            <div className="stats-container">
                <h2>Welcome, {username}</h2>
                <p>Last login: {new Date(lastLogin).toLocaleString()}</p>
                {stats && previousStats && (
                    <div className="stats">
                        <div className="stats-section">
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
                                <p style={{color: '#28a745'}}>Easy Points cost: {EASY_COST}</p>
                                <p style={{color: '#ffd500'}}>Medium Points cost: {MEDIUM_COST}</p>
                                <p style={{color: '#dc3545'}}>Hard Points cost: {HARD_COST}</p>
                                <p>Total Points Value: {calculateTotalPoints()}</p>
                            </div>
                        </div>
                    </div>
                )}
                <button onClick={redeemRewards} className="redeem-button">Redeem Rewards</button>
                {error && <p className="error">{error}</p>}
            </div>
            <button onClick={onLogout} className="logout-button">Logout</button>
        </div>
    );
};

export default Home;

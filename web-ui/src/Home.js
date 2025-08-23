import React, {useEffect, useState} from 'react';
import { Link } from 'react-router-dom';
import axios from './axiosConfig';
import './Home.css';


const Home = ({ username, onLogout }) => {
    const [stats, setStats] = useState(null);
    const [costs, setCosts] = useState(null);
    const [previousStats, setPreviousStats] = useState(null);
    const [lastLogin, setLastLogin] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axios.get('/api/leetcode/stats', { params: { username } });
                setStats(response.data.newStat);
                setPreviousStats(response.data.oldStat);
                setLastLogin(Date.parse(response.data.lastLogin));
            } catch (err) {
                setError('Failed to fetch stats.');
            }
        };
        const fetchCosts = async () => {
            try {
                const response = await axios.get('/api/leetcode/costs', { params: { username } });
                setCosts(response.data);
            } catch (err) {
                setError('Failed to fetch stats.');
            }
        };

        fetchStats();
        fetchCosts();
    }, [username]);

    const getCsrfToken = () => {
        const csrfCookie = document.cookie
            .split('; ')
            .find(row => row.startsWith('XSRF-TOKEN='));
        return csrfCookie ? decodeURIComponent(csrfCookie.split('=')[1]) : null;
    };


    const calculateTotalPoints = () => {
        if (!stats || !previousStats) return 0;
        const {solvedEasy, solvedMedium, solvedHard} = stats;
        const easyPoints = (solvedEasy - previousStats.solvedEasy) * costs.easyCost;
        const mediumPoints = (solvedMedium - previousStats.solvedMedium) * costs.mediumCost;
        const hardPoints = (solvedHard - previousStats.solvedHard) * costs.hardCost;
        return easyPoints + mediumPoints + hardPoints;
    };

    const handleSync = async () => {
        try {
            setError('');
            const response = await axios.get('/api/leetcode/stats', { params: { username } });
            setStats(response.data.newStat);
            setPreviousStats(response.data.oldStat);
            setLastLogin(Date.parse(response.data.lastLogin));
        } catch (err) {
            setError('Failed to sync stats.');
        }
    };

    return (
        <div className="home-container">
            <h1>LeetCode Rewards</h1>
            <div className="stats-container">
                <div className="header-section">
                    <h2>Welcome, {username}</h2>
                    <p>Last login: {new Date(lastLogin).toLocaleString()}</p>
                    <button onClick={handleSync} className="sync-button">
                        🔄 Sync Stats
                    </button>
                </div>
                {stats && previousStats && (
                    <div className="stats-grid">
                        <div className="stats-card left">
                            <h3>Total Tasks Solved</h3>
                            <div className="stat-item">
                                <div className="stat-row">
                                    <span className="stat-label easy">Easy:</span>
                                    <span className="stat-value">{stats.solvedEasy}</span>
                                </div>
                                <div className="stat-row">
                                    <span className="stat-label medium">Medium:</span>
                                    <span className="stat-value">{stats.solvedMedium}</span>
                                </div>
                                <div className="stat-row">
                                    <span className="stat-label hard">Hard:</span>
                                    <span className="stat-value">{stats.solvedHard}</span>
                                </div>
                            </div>
                        </div>
                        <div className="stats-card right">
                            <h3>Tasks Solved Since Last Sync</h3>
                            <div className="stat-item">
                                <div className="stat-row">
                                    <span className="stat-label easy">Easy:</span>
                                    <span className="stat-value">{stats.solvedEasy - previousStats.solvedEasy}</span>
                                </div>
                                <div className="stat-row">
                                    <span className="stat-label medium">Medium:</span>
                                    <span className="stat-value">{stats.solvedMedium - previousStats.solvedMedium}</span>
                                </div>
                                <div className="stat-row">
                                    <span className="stat-label hard">Hard:</span>
                                    <span className="stat-value">{stats.solvedHard - previousStats.solvedHard}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                <div className="points-section">
                    <h3>Point Values & Total Earned</h3>
                    <div className="points-info">
                        <div className="point-costs">
                            <p className="cost-item easy">Easy: {costs?.easyCost} points</p>
                            <p className="cost-item medium">Medium: {costs?.mediumCost} points</p>
                            <p className="cost-item hard">Hard: {costs?.hardCost} points</p>
                        </div>
                        <div className="total-points">
                            Total Points Earned: {calculateTotalPoints()}
                        </div>
                    </div>
                </div>
                <div className="action-buttons">
                    <Link to="/redeem" className="shop-button">
                        🛍️ Redeem Points ({calculateTotalPoints()} available)
                    </Link>
                </div>
                {error && <p className="error">{error}</p>}
            </div>
            <button onClick={onLogout} className="logout-button">Logout</button>
        </div>
    );
};

export default Home;

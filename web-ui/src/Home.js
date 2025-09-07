import React, {useEffect, useState} from 'react';
import { Link } from 'react-router-dom';
import axios from './axiosConfig';
import './Home.css';


const Home = ({ username, onLogout }) => {
    const [stats, setStats] = useState(null);
    const [costs, setCosts] = useState(null);
    const [previousStats, setPreviousStats] = useState(null);
    const [lastSync, setLastSync] = useState(null);
    const [currentPoints, setCurrentPoints] = useState(0);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axios.get('/api/leetcode/stats', { params: { username } });
                setStats(response.data.newStat);
                setPreviousStats(response.data.oldStat);
                setLastSync(Date.parse(response.data.lastSync));
                setCurrentPoints(response.data.currentPoints || 0);
            } catch (err) {
                // Don't set error for auth failures since axios interceptor handles it
                if (err.response?.status !== 401 && err.response?.status !== 403) {
                    setError('Failed to fetch stats.');
                }
            }
        };
        const fetchCosts = async () => {
            try {
                const response = await axios.get('/api/leetcode/costs', { params: { username } });
                setCosts(response.data);
            } catch (err) {
                // Don't set error for auth failures since axios interceptor handles it
                if (err.response?.status !== 401 && err.response?.status !== 403) {
                    setError('Failed to fetch costs.');
                }
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


    const calculateNewPoints = () => {
        if (!stats || !previousStats || !costs) return 0;
        const easyPoints = (stats.solvedEasy - previousStats.solvedEasy) * costs.easyCost;
        const mediumPoints = (stats.solvedMedium - previousStats.solvedMedium) * costs.mediumCost;
        const hardPoints = (stats.solvedHard - previousStats.solvedHard) * costs.hardCost;
        return easyPoints + mediumPoints + hardPoints;
    };

    const handleSync = async () => {
        try {
            setError('');
            const response = await axios.post('/api/leetcode/sync', null, { params: { username } });
            setStats(response.data.newStat);
            setPreviousStats(response.data.oldStat);
            setLastSync(Date.parse(response.data.lastSync));
            setCurrentPoints(response.data.currentPoints || 0);
        } catch (err) {
            // Don't set error for auth failures since axios interceptor handles it
            if (err.response?.status !== 401 && err.response?.status !== 403) {
                setError('Failed to sync stats.');
            }
        }
    };

    return (
        <div className="home-container">
            <h1>LeetCode Rewards</h1>
            <div className="stats-container">
                <div className="header-section">
                    <h2>Welcome, {username}</h2>
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
                            Current Points: {currentPoints}
                        </div>
                    </div>
                </div>
                <div className="sync-section">
                    <div className="sync-info">
                        <p className="last-sync">Last sync: {lastSync ? new Date(lastSync).toLocaleString() : 'Never'}</p>
                        <button onClick={handleSync} className="sync-button">
                            🔄 Sync Stats
                        </button>
                    </div>
                </div>
                <div className="action-buttons">
                    <Link to="/redeem" className="shop-button">
                        🛍️ Redeem Points ({currentPoints} available)
                    </Link>
                </div>
                {error && <p className="error">{error}</p>}
            </div>
            <button onClick={onLogout} className="logout-button">Logout</button>
        </div>
    );
};

export default Home;

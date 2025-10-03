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
    const [skippedTasks, setSkippedTasks] = useState({
        easy: 0,
        medium: 0,
        hard: 0
    });

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
                const response = await axios.get('/api/redeem/costs', { params: { username } });
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



    const calculateNewPoints = () => {
        if (!stats || !previousStats || !costs) return 0;
        const easyPoints = Math.max(0, (stats.solvedEasy - previousStats.solvedEasy - skippedTasks.easy)) * costs.easyCost;
        const mediumPoints = Math.max(0, (stats.solvedMedium - previousStats.solvedMedium - skippedTasks.medium)) * costs.mediumCost;
        const hardPoints = Math.max(0, (stats.solvedHard - previousStats.solvedHard - skippedTasks.hard)) * costs.hardCost;
        return easyPoints + mediumPoints + hardPoints;
    };

    const updateSkippedTasks = (type, delta) => {
        const maxSkip = stats && previousStats ? 
            Math.max(0, stats[`solved${type.charAt(0).toUpperCase() + type.slice(1)}`] - previousStats[`solved${type.charAt(0).toUpperCase() + type.slice(1)}`]) : 0;
        
        setSkippedTasks(prev => ({
            ...prev,
            [type]: Math.max(0, Math.min(maxSkip, prev[type] + delta))
        }));
    };

    const handleSync = async () => {
        try {
            setError('');

            const response = await axios.post('/api/leetcode/sync', {
                skippedEasy: skippedTasks.easy,
                skippedMedium: skippedTasks.medium,
                skippedHard: skippedTasks.hard
            }, {params: {username}});

            setStats(response.data.newStat);
            setPreviousStats(response.data.oldStat);
            setLastSync(Date.parse(response.data.lastSync));
            setCurrentPoints(response.data.currentPoints || 0);
            setSkippedTasks({ easy: 0, medium: 0, hard: 0 });
        } catch (err) {
            console.error('Sync error:', err);
            
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
                                <div className="stat-row-with-skip">
                                    <div className="stat-main">
                                        <span className="stat-label easy">Easy:</span>
                                        <span className="stat-value">{stats.solvedEasy - previousStats.solvedEasy}</span>
                                    </div>
                                    <div className="skip-controls">
                                        <span className="skip-label">Skipped:</span>
                                        <button 
                                            className="skip-btn minus" 
                                            onClick={() => updateSkippedTasks('easy', -1)}
                                            disabled={skippedTasks.easy === 0}
                                        >
                                            -
                                        </button>
                                        <span className="skip-value">{skippedTasks.easy}</span>
                                        <button 
                                            className="skip-btn plus" 
                                            onClick={() => updateSkippedTasks('easy', 1)}
                                            disabled={skippedTasks.easy >= Math.max(0, stats.solvedEasy - previousStats.solvedEasy)}
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                                <div className="stat-row-with-skip">
                                    <div className="stat-main">
                                        <span className="stat-label medium">Medium:</span>
                                        <span className="stat-value">{stats.solvedMedium - previousStats.solvedMedium}</span>
                                    </div>
                                    <div className="skip-controls">
                                        <span className="skip-label">Skipped:</span>
                                        <button 
                                            className="skip-btn minus" 
                                            onClick={() => updateSkippedTasks('medium', -1)}
                                            disabled={skippedTasks.medium === 0}
                                        >
                                            -
                                        </button>
                                        <span className="skip-value">{skippedTasks.medium}</span>
                                        <button 
                                            className="skip-btn plus" 
                                            onClick={() => updateSkippedTasks('medium', 1)}
                                            disabled={skippedTasks.medium >= Math.max(0, stats.solvedMedium - previousStats.solvedMedium)}
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                                <div className="stat-row-with-skip">
                                    <div className="stat-main">
                                        <span className="stat-label hard">Hard:</span>
                                        <span className="stat-value">{stats.solvedHard - previousStats.solvedHard}</span>
                                    </div>
                                    <div className="skip-controls">
                                        <span className="skip-label">Skipped:</span>
                                        <button 
                                            className="skip-btn minus" 
                                            onClick={() => updateSkippedTasks('hard', -1)}
                                            disabled={skippedTasks.hard === 0}
                                        >
                                            -
                                        </button>
                                        <span className="skip-value">{skippedTasks.hard}</span>
                                        <button 
                                            className="skip-btn plus" 
                                            onClick={() => updateSkippedTasks('hard', 1)}
                                            disabled={skippedTasks.hard >= Math.max(0, stats.solvedHard - previousStats.solvedHard)}
                                        >
                                            +
                                        </button>
                                    </div>
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
                        <div className="points-display">
                            <div className="total-points">
                                Current Points: {currentPoints}
                            </div>
                            {stats && previousStats && costs && (
                                <div className="new-points">
                                    Points to earn: {calculateNewPoints()}
                                </div>
                            )}
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

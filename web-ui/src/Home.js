import React, {useEffect, useState} from 'react';
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

    const redeemRewards = async () => {
        try {
        console.log(document.cookie)
            const csrfToken = getCsrfToken();
            if (!csrfToken) {
                setError('CSRF token not found.');
                return;
            }
            await axios.post('/api/leetcode/redeem', { username }, { headers: { 'X-XSRF-TOKEN': csrfToken }});
            alert('Rewards redeemed successfully!');
        } catch (err) {
            setError('Failed to redeem rewards.');
        }
    };

    const calculateTotalPoints = () => {
        if (!stats || !previousStats) return 0;
        const {solvedEasy, solvedMedium, solvedHard} = stats;
        const easyPoints = (solvedEasy - previousStats.solvedEasy) * costs.easyCost;
        const mediumPoints = (solvedMedium - previousStats.solvedMedium) * costs.mediumCost;
        const hardPoints = (solvedHard - previousStats.solvedHard) * costs.hardCost;
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
                                <p style={{color: '#28a745'}}>Easy Points cost: {costs.easyCost}</p>
                                <p style={{color: '#ffd500'}}>Medium Points cost: {costs.mediumCost}</p>
                                <p style={{color: '#dc3545'}}>Hard Points cost: {costs.hardCost}</p>
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

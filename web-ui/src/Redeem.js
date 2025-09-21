import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from './axiosConfig';
import './Redeem.css';

const Redeem = ({ username }) => {
  const [currentPoints, setCurrentPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [redeemedRewards, setRedeemedRewards] = useState(new Set());
  const [isRedeeming, setIsRedeeming] = useState(null);
  const [rewards, setRewards] = useState(null);

  useEffect(() => {
    fetchCurrentPoints();
    fetchRewards();
  }, [username]);

  const fetchCurrentPoints = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/leetcode/stats', { params: { username } });
      setCurrentPoints(response.data.currentPoints || 0);
    } catch (err) {
      setError('Failed to fetch current points balance.');
    } finally {
      setLoading(false);
    }
  };

  const fetchRewards = async () => {
    try {
      const response = await axios.get('/api/redeem/list');
      setRewards(response.data);
    } catch (err) {
      setError('Failed to fetch available rewards.');
    }
  };

  const handleRedeemReward = async (reward) => {
    if (currentPoints < reward.pointCost) return;

    const confirmed = window.confirm(
      `Redeem ${reward.title} for ${reward.pointCost} points?`
    );

    if (!confirmed) return;

    setIsRedeeming(reward.id);

    try {
      await axios.post('/api/redeem', null, {
          params: {
            username: username,
            rewardId: reward.id
          }
      });

      setRedeemedRewards(prev => new Set([...prev, reward.id]));
      const response = await axios.get('/api/redeem/list');
      setRewards(response.data);
      setIsRedeeming(null);
    } catch (err) {
      setError('Failed to redeem reward. Please try again.');
      setIsRedeeming(null);
    }
  };

  const canAfford = (reward) => currentPoints >= reward.pointCost;
  const isRedeemed = (reward) => redeemedRewards.has(reward.id);

  if (loading) {
    return (
      <div className="redeem-container">
        <div className="redeem-content">
          <div className="loading">Loading your points...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="redeem-container">
      <div className="redeem-content">
        <div className="header-controls">
          <Link to="/" className="back-button">← Back to Home</Link>
          <h1 className="page-title">Redeem Rewards</h1>
        </div>
        
        <div className="points-header">
          <div className="points-display">
            <div className="points-value">{currentPoints.toLocaleString()}</div>
            <div className="points-label">Points Available</div>
          </div>
          <button 
            className="refresh-button" 
            onClick={fetchCurrentPoints}
            disabled={loading}
          >
            🔄 Refresh Points
          </button>
        </div>

        <div className="rewards-grid">
          {rewards.map(reward => (
            <div 
              key={reward.id} 
              className={`reward-card ${!canAfford(reward) ? 'insufficient' : ''} ${isRedeemed(reward) ? 'redeemed' : ''}`}
            >
              <div className="reward-image-container">
                <img 
                  src={reward.image} 
                  alt={reward.title}
                  className="reward-image"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="image-fallback" style={{display: 'none'}}>🎁</div>
              </div>
              
              <div className="reward-content">
                <h3 className="reward-title">{reward.title}</h3>
                <p className="reward-description">{reward.description}</p>
                
                <div className="reward-footer">
                  <div className="point-cost">{reward.pointCost} Points</div>
                  
                  {isRedeemed(reward) ? (
                    <div className="redeemed-badge">✅ Redeemed!</div>
                  ) : (
                    <button
                      className="redeem-button"
                      onClick={() => handleRedeemReward(reward)}
                      disabled={!canAfford(reward) || isRedeeming === reward.id}
                    >
                      {isRedeeming === reward.id ? 'Redeeming...' : 
                       canAfford(reward) ? 'Redeem' : 'Insufficient Points'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {error && <div className="error">{error}</div>}
      </div>
    </div>
  );
};

export default Redeem;

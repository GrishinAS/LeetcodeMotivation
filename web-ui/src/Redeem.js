import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from './axiosConfig';
import './Redeem.css';

const rewards = [
  {
    id: 'coffee-no-sugar',
    title: 'No Sugar Coffee',
    description: 'Basic black coffee or americano without sugar',
    pointCost: 100,
    image: '/images/regular-coffee.jpg',
    category: 'coffee'
  },
  {
    id: 'starbucks-latte',
    title: 'Starbucks Latte',
    description: 'Classic Starbucks latte of your choice',
    pointCost: 250,
    image: '/images/paper-cup-starb.png',
    category: 'coffee'
  },
  {
    id: 'monster-energy-no-sugar',
    title: 'Monster Energy Drink (No Sugar)',
    description: 'Sugar-free Monster energy drink',
    pointCost: 300,
    image: '/images/monster-no-sugar.png',
    category: 'energy'
  },
  {
    id: 'starbucks-frappe',
    title: 'Starbucks Frappe',
    description: 'Refreshing Starbucks frappe or frappuccino',
    pointCost: 400,
    image: '/images/starbucks-frappe.jpg',
    category: 'coffee'
  },
  {
    id: 'game-wallet-10',
    title: 'Game Wallet $10',
    description: '$10 credit for Steam, PlayStation, or Xbox',
    pointCost: 700,
    image: '/images/bdo-icon.jpg',
    category: 'gaming'
  }
];

const Redeem = ({ username }) => {
  const [currentPoints, setCurrentPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [redeemedRewards, setRedeemedRewards] = useState(new Set());
  const [isRedeeming, setIsRedeeming] = useState(null);

  useEffect(() => {
    fetchCurrentPoints();
  }, [username]);

  const fetchCurrentPoints = async () => {
    setLoading(true);
    try {
      const [statsResponse, costsResponse] = await Promise.all([
        axios.get('/api/leetcode/stats', { params: { username } }),
        axios.get('/api/leetcode/costs', { params: { username } })
      ]);
      
      const { newStat, oldStat } = statsResponse.data;
      const costs = costsResponse.data;
      
      const easyPoints = (newStat.solvedEasy - oldStat.solvedEasy) * costs.easyCost;
      const mediumPoints = (newStat.solvedMedium - oldStat.solvedMedium) * costs.mediumCost;
      const hardPoints = (newStat.solvedHard - oldStat.solvedHard) * costs.hardCost;
      
      setCurrentPoints(easyPoints + mediumPoints + hardPoints);
    } catch (err) {
      setError('Failed to fetch current points balance.');
    } finally {
      setLoading(false);
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
      // For now, simulate redemption by deducting points locally
      // In a real implementation, this would call a backend API
      setCurrentPoints(prev => prev - reward.pointCost);
      setRedeemedRewards(prev => new Set([...prev, reward.id]));
      
      setTimeout(() => {
        alert(`${reward.title} redeemed successfully!`);
        setIsRedeeming(null);
      }, 1000);
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
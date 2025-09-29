// Mock API service for development mode
const MOCK_DELAY = 500; // Simulate network delay

// Mock user data
const mockUser = {
  username: process.env.REACT_APP_MOCK_USERNAME || 'testuser',
  email: process.env.REACT_APP_MOCK_EMAIL || 'test@example.com',
  leetcodeAcc: process.env.REACT_APP_MOCK_LEETCODE_ACC || 'testleetcode',
  jwtToken: 'mock-jwt-token-' + Date.now()
};

// Mock stats data
const mockStats = {
  newStat: {
    solvedEasy: 150,
    solvedMedium: 75,
    solvedHard: 25
  },
  oldStat: {
    solvedEasy: 140,
    solvedMedium: 70,
    solvedHard: 20
  },
  lastLogin: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 24 hours ago
  currentPoints: 2750 // Mock current points balance
};

// Mock costs data
const mockCosts = {
  easyCost: 100,
  mediumCost: 300,
  hardCost: 750
};

// Mock rewards data
const mockRewards = [
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

// Simulate API delay
const delay = (ms = MOCK_DELAY) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API responses
export const mockApi = {
  // User authentication
  login: async (credentials) => {
    await delay();
    console.log('[MOCK API] Login attempt:', credentials);
    
    // Always succeed in mock mode
    return {
      data: mockUser,
      status: 200
    };
  },

  signup: async (userData) => {
    await delay();
    console.log('[MOCK API] Signup attempt:', userData);
    
    return {
      data: { message: 'User created successfully' },
      status: 201
    };
  },

  // CSRF token
  getCsrf: async () => {
    await delay(100);
    return {
      data: { token: 'mock-csrf-token-' + Date.now() },
      status: 200
    };
  },

  // Stats
  getStats: async (params) => {
    await delay();
    console.log('[MOCK API] Getting stats for:', params.username);
    
    // Simulate some randomness in stats
    const variation = Math.floor(Math.random() * 5);
    return {
      data: {
        ...mockStats,
        newStat: {
          ...mockStats.newStat,
          solvedEasy: mockStats.newStat.solvedEasy + variation
        }
      },
      status: 200
    };
  },

  // Sync stats (simulates earning points)
  syncStats: async (params) => {
    await delay();
    console.log('[MOCK API] Syncing stats for:', params.username);
    
    // Simulate earning some points
    const pointsEarned = Math.floor(Math.random() * 500);
    const newTotal = mockStats.currentPoints + pointsEarned;
    
    // Update mock data
    mockStats.currentPoints = newTotal;
    mockStats.oldStat = { ...mockStats.newStat };
    mockStats.newStat = {
      solvedEasy: mockStats.newStat.solvedEasy + Math.floor(Math.random() * 3),
      solvedMedium: mockStats.newStat.solvedMedium + Math.floor(Math.random() * 2),
      solvedHard: mockStats.newStat.solvedHard + Math.floor(Math.random() * 1)
    };
    
    return {
      data: mockStats,
      status: 200
    };
  },

  getCosts: async (params) => {
    await delay();
    console.log('[MOCK API] Getting costs for:', params.username);
    
    return {
      data: mockCosts,
      status: 200
    };
  },

  getRewards: async () => {
    await delay();
    console.log('[MOCK API] Getting rewards');
    
    return {
      data: mockRewards,
      status: 200
    };
  },

  // Generic API call handler
  get: async (url, config = {}) => {
    console.log('[MOCK API] GET:', url, config);
    
    if (url.includes('/api/user/login')) {
      return mockApi.login(config.data);
    }
    
    if (url.includes('/api/user/signup')) {
      return mockApi.signup(config.data);
    }
    
    if (url.includes('/api/user/csrf')) {
      return mockApi.getCsrf();
    }
    
    if (url.includes('/api/leetcode/stats')) {
      return mockApi.getStats(config.params || {});
    }
    
    if (url.includes('/api/leetcode/sync')) {
      return mockApi.syncStats(config.params || {});
    }
    
    if (url.includes('/api/redeem/costs')) {
      return mockApi.getCosts(config.params || {});
    }
    
    if (url.includes('/api/redeem/list')) {
      return mockApi.getRewards();
    }
    
    // Default mock response
    await delay();
    return {
      data: { message: 'Mock API response', url },
      status: 200
    };
  },

  post: async (url, data, config = {}) => {
    console.log('[MOCK API] POST:', url, data, config);
    
    if (url.includes('/api/user/login')) {
      return mockApi.login(data);
    }
    
    if (url.includes('/api/user/signup')) {
      return mockApi.signup(data);
    }
    
    if (url.includes('/api/leetcode/sync')) {
      return mockApi.syncStats(config.params || {});
    }
    
    // Default mock response
    await delay();
    return {
      data: { message: 'Mock API POST response', url },
      status: 200
    };
  }
};

// Axios-like interface
export const createMockAxios = () => {
  return {
    get: mockApi.get,
    post: mockApi.post,
    put: mockApi.post,
    delete: mockApi.get,
    request: mockApi.get,
    create: () => createMockAxios(),
    interceptors: {
      request: {
        use: (onFulfilled, onRejected) => {
          console.log('[MOCK API] Request interceptor registered');
          return 0; // Return interceptor id
        }
      },
      response: {
        use: (onFulfilled, onRejected) => {
          console.log('[MOCK API] Response interceptor registered');
          return 0; // Return interceptor id
        }
      }
    }
  };
};

export default mockApi;
// API utility functions for backend communication
import { API_BASE_URL } from './config.js';

/**
 * Generic API request function
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Request options
 * @returns {Promise} API response
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem('token');
  const authHeader = token ? { 'Authorization': `Bearer ${token}` } : {};
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...authHeader,
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const contentType = response.headers.get('content-type') || '';
      
      if (contentType.includes('application/json')) {
        const errorData = await response.json();
        
        // Handle validation errors from Spring Boot
        if (errorData.errors && Array.isArray(errorData.errors)) {
          const validationErrors = {};
          errorData.errors.forEach(error => {
            validationErrors[error.field] = error.defaultMessage;
          });
          throw new Error(JSON.stringify({
            type: 'validation',
            errors: validationErrors,
            message: 'Validation failed'
          }));
        }
        
        // Handle other JSON errors
        throw new Error(JSON.stringify({
          type: 'api',
          message: errorData.message || errorData.error || 'API error',
          status: response.status
        }));
      } else {
        // Handle non-JSON errors
        const text = await response.text();
        throw new Error(JSON.stringify({
          type: 'api',
          message: text || `API error: ${response.status} ${response.statusText}`,
          status: response.status
        }));
      }
    }
    
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      return await response.json();
    }
    return null;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

/**
 * Get all games with optional filtering
 * @param {Object} filters - Filter options
 * @returns {Promise<Array>} Array of games
 */
export const getGames = async (filters = {}) => {
  const params = new URLSearchParams();
  
  if (filters.category) params.append('category', filters.category);
  if (filters.type) params.append('type', filters.type);
  if (filters.search) params.append('search', filters.search);
  if (filters.minPrice) params.append('minPrice', filters.minPrice);
  if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
  if (filters.minRating) params.append('minRating', filters.minRating);
  if (filters.featured) params.append('featured', filters.featured);
  if (filters.page) params.append('page', filters.page);
  if (filters.size) params.append('size', filters.size);
  
  const queryString = params.toString();
  const endpoint = `/games${queryString ? `?${queryString}` : ''}`;
  
  return apiRequest(endpoint);
};

/**
 * Get all game names and IDs for dropdown selection
 * @returns {Promise<Array>} Array of games with id and name only
 */
export const getGameNames = async () => {
  return apiRequest('/games/names');
};

/**
 * Get featured games
 * @param {number} limit - Number of games to fetch
 * @returns {Promise<Array>} Array of featured games
 */
export const getFeaturedGames = async (limit = 6) => {
  // Use dedicated featured endpoint with pagination and return array
  const res = await apiRequest(`/games/featured?size=${limit}&page=0`);
  return Array.isArray(res) ? res : (res?.content ?? []);
};

/**
 * Get game by ID
 * @param {number} id - Game ID
 * @returns {Promise<Object>} Game details
 */
export const getGameById = async (id) => {
  return apiRequest(`/games/${id}`);
};

/**
 * Search games
 * @param {string} query - Search query
 * @param {Object} options - Search options
 * @returns {Promise<Array>} Search results
 */
export const searchGames = async (query, options = {}) => {
  return getGames({ search: query, ...options });
};

/**
 * Get products by category
 * @param {string} category - Product category
 * @param {Object} options - Additional options
 * @returns {Promise<Array>} Products in category
 */
export const getGamesByCategory = async (category, options = {}) => {
  return getGames({ category, ...options });
};

/** Create a game (admin) */
export const createGame = async (game) => {
  return apiRequest('/games', {
    method: 'POST',
    body: JSON.stringify(game),
  });
};

// Backend-driven game listing helpers
export const listGamesPage = async (page = 0, size = 12, sort = '') => {
  const sortParam = sort ? `&sort=${encodeURIComponent(sort)}` : '';
  return apiRequest(`/games?page=${page}&size=${size}${sortParam}`);
};

export const searchGamesPage = async (keyword, page = 0, size = 12, sort = '') => {
  const sortParam = sort ? `&sort=${encodeURIComponent(sort)}` : '';
  return apiRequest(`/games/search?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}${sortParam}`);
};

export const getGamesByCategoryPage = async (category, page = 0, size = 12, sort = '') => {
  const sortParam = sort ? `&sort=${encodeURIComponent(sort)}` : '';
  return apiRequest(`/games/category/${category}?page=${page}&size=${size}${sortParam}`);
};

// Admin imports (secured)
export const adminImportGames = async (pageSize = 20, maxPages = 10) => {
  return apiRequest(`/admin/games/import?pageSize=${pageSize}&maxPages=${maxPages}`, {
    method: 'POST'
  });
};



export const adminGetImportStatus = async () => {
  return apiRequest('/admin/games/import/status');
};

// Steam Account Management (Public endpoints for frontend)
export const getSteamAccounts = async (page = 0, size = 20, sortBy = 'id', sortDir = 'desc') => {
  return apiRequest(`/steam-accounts?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`);
};

export const getAllSteamAccounts = async () => {
  return apiRequest('/steam-accounts/all');
};

export const getSteamAccountById = async (id) => {
  return apiRequest(`/steam-accounts/${id}`);
};

export const searchSteamAccountsByGame = async (gameName, page = 0, size = 12) => {
  return apiRequest(`/steam-accounts/search/game?gameName=${encodeURIComponent(gameName)}&page=${page}&size=${size}`);
};

export const getSteamAccountsByGameId = async (gameId) => {
  return apiRequest(`/steam-accounts/game/${gameId}`);
};

export const getSteamAccountsByType = async (accountType, page = 0, size = 20) => {
  return apiRequest(`/steam-accounts/type/${accountType}?page=${page}&size=${size}`);
};

export const searchSteamAccounts = async (query, page = 0, size = 20) => {
  return apiRequest(`/steam-accounts/search?q=${encodeURIComponent(query)}&page=${page}&size=${size}`);
};

export const getAvailableSteamAccounts = async () => {
  return apiRequest('/steam-accounts/available');
};

export const getAvailableSteamAccountsByType = async (accountType) => {
  return apiRequest(`/steam-accounts/available/${accountType}`);
};

// Validate a steam account via backend microservice wrapper
export const validateSteamAccount = async (id) => {
  const t0 = performance.now();
  console.log('[API] validateSteamAccount start id=', id);
  try {
    const result = await apiRequest(`/steam-accounts/${id}/validate`, {
      method: 'POST'
    });
    const t1 = performance.now();
    console.log('[API] validateSteamAccount ok id=', id, 'durationMs=', Math.round(t1 - t0), 'result=', result);
    return result;
  } catch (error) {
    const t1 = performance.now();
    console.error('[API] validateSteamAccount error id=', id, 'durationMs=', Math.round(t1 - t0), error);
    throw error;
  }
};

// Steam Account Management (Admin only - for admin panel)
export const getSteamAccountsAdmin = async (page = 0, size = 20, sortBy = 'id', sortDir = 'desc') => {
  return apiRequest(`/admin/steam-accounts?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`);
};

export const getAllSteamAccountsAdmin = async () => {
  return apiRequest('/admin/steam-accounts/all');
};

export const getSteamAccountByIdAdmin = async (id) => {
  return apiRequest(`/admin/steam-accounts/${id}`);
};

export const getSteamAccountsByTypeAdmin = async (accountType, page = 0, size = 20) => {
  return apiRequest(`/admin/steam-accounts/type/${accountType}?page=${page}&size=${size}`);
};

export const searchSteamAccountsAdmin = async (query, page = 0, size = 20) => {
  return apiRequest(`/admin/steam-accounts/search?q=${encodeURIComponent(query)}&page=${page}&size=${size}`);
};

export const getAvailableSteamAccountsAdmin = async () => {
  return apiRequest('/admin/steam-accounts/available');
};

export const getAvailableSteamAccountsByTypeAdmin = async (accountType) => {
  return apiRequest(`/admin/steam-accounts/available/${accountType}`);
};

export const getSteamAccountsByStatus = async (status) => {
  return apiRequest(`/admin/steam-accounts/status/${status}`);
};

export const createSteamAccount = async (accountData) => {
  return apiRequest('/account-info/with-steam-accounts', {
    method: 'POST',
    body: JSON.stringify(accountData),
  });
};

export const updateSteamAccount = async (id, accountData) => {
  return apiRequest(`/admin/steam-accounts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(accountData),
  });
};

export const updateSteamAccountStatus = async (id, status) => {
  return apiRequest(`/admin/steam-accounts/${id}/status?status=${status}`, {
    method: 'PATCH',
  });
};

export const deleteSteamAccount = async (id) => {
  return apiRequest(`/admin/steam-accounts/${id}`, {
    method: 'DELETE',
  });
};

export const getSteamAccountStats = async () => {
  return apiRequest('/admin/steam-accounts/stats');
};

/**
 * Upload image file
 * @param {File} file - Image file to upload
 * @param {string} type - Upload type ('steam-accounts' or 'games')
 * @returns {Promise<Object>} Upload response with file URL
 */
export const uploadImage = async (file, type = 'steam-accounts') => {
  const url = `${API_BASE_URL}/admin/upload/image`;
  const token = localStorage.getItem('token');
  const authHeader = token ? { 'Authorization': `Bearer ${token}` } : {};
  
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);
  
  const config = {
    method: 'POST',
    headers: {
      ...authHeader,
      // Don't set Content-Type for FormData, let browser set it with boundary
    },
    body: formData,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Upload failed: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Image upload failed:', error);
    throw error;
  }
};

/**
 * Transform backend game to frontend format
 * @param {Object} game - Backend game object (now GameWithPriceDto)
 * @returns {Object} Frontend game format
 */
export const transformGame = (game) => {
  return {
    id: game.id,
    name: game.name,
    description: game.description,
    price: game.price,
    originalPrice: game.originalPrice,
    discountPercentage: game.discountPercentage,
    imageUrl: game.imageUrl,
    rating: game.rating,
    releaseDate: game.releaseDate,
    category: game.category,
    type: game.type,
    featured: game.featured,
    stockQuantity: game.stockQuantity,
    inStock: game.inStock,
    active: game.active,
    // Parse metadata if available
    metadata: game.metadata ? JSON.parse(game.metadata) : null,
    // Extract genres, platforms, etc. from metadata
    genres: game.metadata ? JSON.parse(game.metadata).genres || [] : [],
    platforms: game.metadata ? JSON.parse(game.metadata).platforms || [] : [],
    developers: game.metadata ? JSON.parse(game.metadata).developers || [] : [],
    publishers: game.metadata ? JSON.parse(game.metadata).publishers || [] : [],
    tags: game.metadata ? JSON.parse(game.metadata).tags || [] : [],
    metacritic: game.metadata ? JSON.parse(game.metadata).metacritic : null,
    playtime: game.metadata ? JSON.parse(game.metadata).playtime : null,
    esrbRating: game.metadata ? JSON.parse(game.metadata).esrb_rating : null,
    website: game.metadata ? JSON.parse(game.metadata).website : null,
  };
};

/**
 * Transform array of backend games
 * @param {Array} games - Array of backend games
 * @returns {Array} Array of transformed games
 */
export const transformGames = (games) => {
  return games.map(transformGame);
};



// Steam Account Order Management
export const createSteamAccountOrder = async (accountId) => {
  return apiRequest('/steam-account-orders', {
    method: 'POST',
    body: JSON.stringify({ steamAccountId: accountId }),
  });
};

export const createAndPaySteamAccountOrderWithBalance = async (accountId) => {
  return apiRequest('/steam-account-orders/pay-with-balance', {
    method: 'POST',
    body: JSON.stringify({ steamAccountId: accountId }),
  });
};

export const getOrderByOrderId = async (orderId) => {
  return apiRequest(`/steam-account-orders/${orderId}`);
};

export const getUserOrders = async (page = 0, size = 10) => {
  return apiRequest(`/steam-account-orders?page=${page}&size=${size}`);
};

export const getAllUserOrders = async () => {
  return apiRequest('/steam-account-orders/profile');
};

// Admin APIs
export const getAllOrdersAdmin = async () => {
  return apiRequest('/admin/orders');
};

export const getOrdersByStatusAdmin = async (status) => {
  return apiRequest(`/admin/orders/status/${status}`);
};

export const getOrdersByClassificationAdmin = async (classification) => {
  return apiRequest(`/admin/orders/classification/${classification}`);
};

export const getOrderByIdAdmin = async (orderId) => {
  return apiRequest(`/admin/orders/${orderId}`);
};

export const markOrderAsDeliveredAdmin = async (orderId) => {
  return apiRequest(`/admin/orders/${orderId}/deliver`, {
    method: 'POST'
  });
};

export const markOrderAsDeliveredWithAccountAdmin = async (orderId, accountDetails) => {
  return apiRequest(`/admin/orders/${orderId}/deliver-with-account`, {
    method: 'POST',
    body: JSON.stringify(accountDetails)
  });
};

export const cancelOrderAdmin = async (orderId) => {
  return apiRequest(`/admin/orders/${orderId}/cancel`, {
    method: 'POST'
  });
};

export const getRevenueStats = async (startDate, endDate) => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  
  const queryString = params.toString();
  return apiRequest(`/admin/revenue/stats${queryString ? `?${queryString}` : ''}`);
};

export const getMonthlyRevenue = async (startDate, endDate) => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  
  const queryString = params.toString();
  return apiRequest(`/admin/revenue/monthly${queryString ? `?${queryString}` : ''}`);
};

export const markOrderAsDelivered = async (orderId) => {
  return apiRequest(`/steam-account-orders/${orderId}/deliver`, {
    method: 'POST',
  });
};

export const cancelOrder = async (orderId) => {
  return apiRequest(`/steam-account-orders/${orderId}/cancel`, {
    method: 'POST',
  });
};

export const checkOrderStatus = async (orderId) => {
  return apiRequest(`/steam-account-orders/${orderId}/status`);
};

// Cart checkout - create orders from cart items
export const checkoutCart = async () => {
  return apiRequest('/cart/checkout', {
    method: 'POST',
  });
};

// Cart checkout with balance payment - create orders and pay with balance
export const checkoutCartWithBalance = async () => {
  return apiRequest('/cart/checkout-with-balance', {
    method: 'POST',
  });
};


// Wallet deposit APIs
export const createWalletDeposit = async (amount) => {
  return apiRequest('/wallet/deposits', {
    method: 'POST',
    body: JSON.stringify({ amount })
  });
};

export const getWalletDeposit = async (depositId) => {
  return apiRequest(`/wallet/deposits/${depositId}`);
};


export const getMyWalletDeposits = async () => {
  return apiRequest('/wallet/deposits');
};

// Refund transactions APIs
export const getMyRefunds = async () => {
  return apiRequest('/user/refunds');
};

// User balance APIs
export const getUserBalance = async () => {
  return apiRequest('/user/balance');
};

export const recalculateUserBalance = async () => {
  return apiRequest('/user/balance/recalculate', {
    method: 'POST'
  });
};

// Steam Import APIs
export const getSteamImportStatus = async () => {
  return apiRequest('/admin/steam-import/status');
};

export const startSteamImport = async () => {
  return apiRequest('/admin/steam-import/start', {
    method: 'POST'
  });
};



// Account Info APIs
// Public endpoints for fetching account info to display in inventory
export const getAllAccountInfos = async () => {
  return apiRequest('/account-info');
};

export const getAccountInfosPage = async (page = 0, size = 20) => {
  return apiRequest(`/account-info/page?page=${page}&size=${size}`);
};

export const getAccountInfoById = async (id) => {
  return apiRequest(`/account-info/${id}`);
};

export const deleteAccountInfo = async (id) => {
  return apiRequest(`/account-info/${id}`, {
    method: 'DELETE'
  });
};

export const updateAccountInfo = async (id, data) => {
  return apiRequest(`/account-info/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};


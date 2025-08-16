import { RAWG_CONFIG } from './config.js';

// RAWG.io API utility functions

/**
 * Fetch games from RAWG.io API
 * @param {Object} options - Query options
 * @param {number} options.pageSize - Number of games to fetch (default: 20)
 * @param {string} options.ordering - Sort order (default: '-rating')
 * @param {string} options.search - Search query
 * @param {string} options.genres - Filter by genres
 * @param {string} options.platforms - Filter by platforms
 * @param {string} options.dates - Filter by release dates
 * @returns {Promise<Array>} Array of game objects
 */
export const fetchGames = async (options = {}) => {
  const {
    pageSize = RAWG_CONFIG.DEFAULT_PAGE_SIZE,
    ordering = '-rating',
    search = '',
    genres = '',
    platforms = '',
    dates = ''
  } = options;

  try {
    const params = new URLSearchParams({
      key: RAWG_CONFIG.API_KEY,
      page_size: Math.min(pageSize, RAWG_CONFIG.MAX_PAGE_SIZE),
      ordering: ordering
    });

    if (search) {
      params.append('search', search);
    }

    if (genres) {
      params.append('genres', genres);
    }

    if (platforms) {
      params.append('platforms', platforms);
    }

    if (dates) {
      params.append('dates', dates);
    }

    const response = await fetch(`${RAWG_CONFIG.BASE_URL}/games?${params}`);
    
    if (!response.ok) {
      throw new Error(`RAWG API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform RAWG data to our product format
    return data.results.map(game => ({
      id: game.id,
      name: game.name,
      description: game.description || 'No description available',
      price: Math.floor(Math.random() * 500000) + 100000, // Random price between 100,000-600,000 VND
      originalPrice: Math.floor(Math.random() * 200000) + 600000, // Random original price 600,000-800,000 VND
      discountPercentage: Math.floor(Math.random() * 30) + 10, // Random discount 10-40%
      imageUrl: game.background_image,
      rating: game.rating,
      releaseDate: game.released,
      category: 'GAME_KEY',
      type: 'STEAM_KEY',
      featured: true,
      stockQuantity: Math.floor(Math.random() * 50) + 10,
      active: true,
      // Additional RAWG data
      metacritic: game.metacritic,
      playtime: game.playtime,
      platforms: game.platforms?.map(p => p.platform.name) || [],
      genres: game.genres?.map(g => g.name) || [],
      tags: game.tags?.map(t => t.name) || [],
      esrb_rating: game.esrb_rating?.name || null,
      website: game.website,
      developers: game.developers?.map(d => d.name) || [],
      publishers: game.publishers?.map(p => p.name) || []
    }));
  } catch (error) {
    console.error('Error fetching games from RAWG:', error);
    return [];
  }
};

/**
 * Fetch featured/popular games
 * @param {number} count - Number of games to fetch
 * @returns {Promise<Array>} Array of featured games
 */
export const fetchFeaturedGames = async (count = 6) => {
  return fetchGames({
    pageSize: count,
    ordering: '-rating'
  });
};

/**
 * Search games by query
 * @param {string} query - Search query
 * @param {number} count - Number of results
 * @returns {Promise<Array>} Array of search results
 */
export const searchGames = async (query, count = 20) => {
  return fetchGames({
    pageSize: count,
    search: query
  });
};

/**
 * Fetch games by genre
 * @param {string} genre - Genre name
 * @param {number} count - Number of results
 * @returns {Promise<Array>} Array of games in genre
 */
export const fetchGamesByGenre = async (genre, count = 20) => {
  return fetchGames({
    pageSize: count,
    genres: genre
  });
};

/**
 * Fetch recent releases
 * @param {number} count - Number of games to fetch
 * @returns {Promise<Array>} Array of recent games
 */
export const fetchRecentGames = async (count = 20) => {
  return fetchGames({
    pageSize: count,
    ordering: '-released'
  });
};

/**
 * Fetch upcoming games
 * @param {number} count - Number of games to fetch
 * @returns {Promise<Array>} Array of upcoming games
 */
export const fetchUpcomingGames = async (count = 20) => {
  return fetchGames({
    pageSize: count,
    ordering: 'released',
    dates: '2024-01-01,2025-12-31'
  });
};

/**
 * Fetch games by platform
 * @param {string} platform - Platform name (PC, PlayStation, Xbox, etc.)
 * @param {number} count - Number of results
 * @returns {Promise<Array>} Array of games for platform
 */
export const fetchGamesByPlatform = async (platform, count = 20) => {
  return fetchGames({
    pageSize: count,
    platforms: platform
  });
};

/**
 * Get game details by ID
 * @param {number} gameId - RAWG game ID
 * @returns {Promise<Object>} Game details
 */
export const fetchGameDetails = async (gameId) => {
  try {
    const response = await fetch(`${RAWG_CONFIG.BASE_URL}/games/${gameId}?key=${RAWG_CONFIG.API_KEY}`);
    
    if (!response.ok) {
      throw new Error(`RAWG API error: ${response.status}`);
    }

    const game = await response.json();
    
    return {
      id: game.id,
      name: game.name,
      description: game.description || 'No description available',
      price: Math.floor(Math.random() * 500000) + 100000, // Random price between 100,000-600,000 VND
      originalPrice: Math.floor(Math.random() * 200000) + 600000, // Random original price 600,000-800,000 VND
      discountPercentage: Math.floor(Math.random() * 30) + 10,
      imageUrl: game.background_image,
      rating: game.rating,
      releaseDate: game.released,
      category: 'GAME_KEY',
      type: 'STEAM_KEY',
      featured: true,
      stockQuantity: Math.floor(Math.random() * 50) + 10,
      active: true,
      // Additional details
      metacritic: game.metacritic,
      playtime: game.playtime,
      platforms: game.platforms?.map(p => p.platform.name) || [],
      genres: game.genres?.map(g => g.name) || [],
      tags: game.tags?.map(t => t.name) || [],
      esrb_rating: game.esrb_rating?.name || null,
      website: game.website,
      developers: game.developers?.map(d => d.name) || [],
      publishers: game.publishers?.map(p => p.name) || [],
      screenshots: game.short_screenshots?.map(s => s.image) || [],
      achievements_count: game.achievements_count,
      ratings_count: game.ratings_count,
      suggestions_count: game.suggestions_count
    };
  } catch (error) {
    console.error('Error fetching game details:', error);
    return null;
  }
};

/**
 * Get multiple game details by IDs
 * @param {Array} gameIds - Array of RAWG game IDs
 * @returns {Promise<Array>} Array of game details
 */
export const fetchMultipleGameDetails = async (gameIds) => {
  const promises = gameIds.map(id => fetchGameDetails(id));
  const results = await Promise.allSettled(promises);
  return results
    .filter(result => result.status === 'fulfilled' && result.value)
    .map(result => result.value);
};

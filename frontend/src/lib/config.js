// Configuration file for environment variables and API settings

// Environment detection - more robust approach
const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development';

// Backend API Configuration
export const BACKEND_CONFIG = {
  // Priority: 1. Environment variable, 2. Auto-detection, 3. Fallback
  BASE_URL: import.meta.env.VITE_BACKEND_URL || 
    (isDevelopment ? 'http://localhost:8080' : 'https://api.gurroshop.com'),
  API_PATH: '/api',
  getFullUrl: () => `${BACKEND_CONFIG.BASE_URL}${BACKEND_CONFIG.API_PATH}`,
  // Helper function to get proper image URLs
  getImageUrl: (imageUrl) => {
    if (!imageUrl) return '';
    // If it's already a full URL, return as is
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    // If it starts with /api/uploads/, prepend the full backend URL (for Steam accounts)
    if (imageUrl.startsWith('/api/uploads/')) {
      return `${BACKEND_CONFIG.BASE_URL}${imageUrl}`;
    }
    // If it starts with /uploads/, prepend the full backend URL + /api (for games)
    if (imageUrl.startsWith('/uploads/')) {
      return `${BACKEND_CONFIG.BASE_URL}/api${imageUrl}`;
    }
    // Otherwise, return as is (for RAWG images, etc.)
    return imageUrl;
  }
};

// RAWG.io API Configuration
export const RAWG_CONFIG = {
  API_KEY: '5901cb0625a547eb922e9c700744032e',
  BASE_URL: 'https://api.rawg.io/api'
};

// App Configuration
export const APP_CONFIG = {
  NAME: 'Shop Acc Game',
  VERSION: '1.0.0',
  ENVIRONMENT: isDevelopment ? 'development' : 'production'
};

// API Endpoints
export const API_ENDPOINTS = {
  BACKEND: BACKEND_CONFIG.getFullUrl(),
  RAWG: RAWG_CONFIG.BASE_URL
};

// Feature Flags
export const FEATURES = {
  ENABLE_RAWG_INTEGRATION: true,
  ENABLE_SEARCH: true
};

// Export for backward compatibility
export const API_BASE_URL = BACKEND_CONFIG.getFullUrl();

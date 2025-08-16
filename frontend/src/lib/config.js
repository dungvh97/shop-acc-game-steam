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
};

// RAWG.io API Configuration
export const RAWG_CONFIG = {
  API_KEY: '5901cb0625a547eb922e9c700744032e', // Replace with your actual API key
  BASE_URL: 'https://api.rawg.io/api',
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 40
};

// Application Configuration
export const APP_CONFIG = {
  NAME: 'Game Account Shop',
  DESCRIPTION: 'Premium game accounts and keys',
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

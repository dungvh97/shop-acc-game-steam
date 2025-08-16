/**
 * Utility functions for handling character encoding issues
 */

/**
 * Decodes a name string with multiple fallback methods to handle various encoding issues
 * @param {string} name - The name string to decode
 * @returns {string} - The decoded name string
 */
export const decodeName = (name) => {
  if (!name || typeof name !== 'string') return '';
  
  try {
    // Try URL decoding first (most common for OAuth)
    return decodeURIComponent(name);
  } catch (e) {
    try {
      // Try unescape as fallback
      return unescape(name);
    } catch (e2) {
      try {
        // Try to handle HTML entities
        const textarea = document.createElement('textarea');
        textarea.innerHTML = name;
        return textarea.value;
      } catch (e3) {
        // Return as-is if all decoding fails
        return name;
      }
    }
  }
};

/**
 * Safely displays a name with proper encoding handling
 * @param {string} name - The name to display
 * @param {string} fallback - Fallback text if name is empty
 * @returns {string} - The safely decoded name
 */
export const safeDisplayName = (name, fallback = '') => {
  if (!name) return fallback;
  return decodeName(name);
};

/**
 * Decodes multiple name fields from an object
 * @param {Object} obj - Object containing name fields
 * @param {Array} nameFields - Array of field names to decode
 * @returns {Object} - Object with decoded name fields
 */
export const decodeNameFields = (obj, nameFields = ['firstName', 'lastName', 'name']) => {
  if (!obj || typeof obj !== 'object') return obj;
  
  const decoded = { ...obj };
  
  nameFields.forEach(field => {
    if (decoded[field]) {
      decoded[field] = decodeName(decoded[field]);
    }
  });
  
  return decoded;
};

/**
 * Decodes user object with common name fields
 * @param {Object} user - User object
 * @returns {Object} - User object with decoded names
 */
export const decodeUserNames = (user) => {
  if (!user) return user;
  
  return decodeNameFields(user, ['firstName', 'lastName', 'username']);
};

/**
 * Decodes game/account object with name field
 * @param {Object} item - Game or account object
 * @returns {Object} - Object with decoded name
 */
export const decodeItemName = (item) => {
  if (!item) return item;
  
  return decodeNameFields(item, ['name', 'title']);
};

/**
 * Utility functions for handling images and fallbacks
 */

/**
 * Creates a fallback SVG icon for when images fail to load
 * @param {string} className - CSS classes for the SVG
 * @param {number} size - Size of the icon (width and height)
 * @returns {JSX.Element} SVG icon component
 */
export const createFallbackIcon = (className = "w-8 h-8", size = 32) => (
  <svg 
    className={className} 
    fill="currentColor" 
    viewBox="0 0 20 20"
    width={size}
    height={size}
  >
    <path 
      fillRule="evenodd" 
      d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" 
      clipRule="evenodd" 
    />
  </svg>
);

/**
 * Handles image loading errors by hiding the image and showing fallback
 * @param {Event} e - The error event
 * @param {HTMLElement} fallbackElement - The fallback element to show
 */
export const handleImageError = (e, fallbackElement) => {
  if (e.target && fallbackElement) {
    e.target.style.display = 'none';
    fallbackElement.style.display = 'flex';
  }
};

/**
 * Creates a fallback container with icon
 * @param {string} className - CSS classes for the container
 * @param {string} iconClassName - CSS classes for the icon
 * @returns {JSX.Element} Fallback container component
 */
export const createFallbackContainer = (className = "w-full h-full", iconClassName = "w-8 h-8") => (
  <div className={`${className} bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center`}>
    {createFallbackIcon(iconClassName)}
  </div>
); 
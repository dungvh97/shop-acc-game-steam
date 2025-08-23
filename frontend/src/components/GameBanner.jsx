import React from 'react';
import { Link } from 'react-router-dom';
import { createFallbackContainer } from '../utils/imageUtils';

const GameBanner = ({ game, size = 'medium', className = '' }) => {
  const sizeClasses = {
    small: 'h-16 sm:h-20 md:h-24',
    medium: 'h-24 sm:h-28 md:h-32',
    large: 'h-32 sm:h-36 md:h-40'
  };

  const getImageUrl = (imageUrl) => {
    // Return the actual image URL if it exists
    if (imageUrl) {
      return imageUrl;
    }
    // Return null to trigger the fallback SVG
    return null;
  };

  return (
    <Link 
      to={`/games/${game.id}`} 
      className={`block ${sizeClasses[size]} ${className} overflow-hidden rounded-lg hover:scale-105 transition-transform duration-200`}
    >
      <div className="relative w-full h-full">
        {getImageUrl(game.imageUrl) ? (
          <img
            src={getImageUrl(game.imageUrl)}
            alt={game.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        {createFallbackContainer('w-full h-full', 'w-8 h-8')}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-2">
          <h3 className="text-white font-bold text-xs sm:text-sm truncate">{game.name}</h3>
          {game.price && (
            <p className="text-white/90 text-xs">
              {game.price === 0 ? 'FREE' : `${game.price} VND`}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
};

export default GameBanner;

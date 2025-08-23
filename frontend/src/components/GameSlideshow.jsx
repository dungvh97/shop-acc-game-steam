import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const GameSlideshow = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Get all 13 images from uploads folder
  const images = [
    'center_1.jpg',
    'center_2.jpg',
    'center_3.jpg',
    'center_4.jpg',
    'center_5.jpg',
    'left_1.jpg',
    'left_2.jpg', 
    'right_1.jpg',
    'right_2.jpg',
    'bottom_1.jpg',
    'bottom_2.jpg',
    'bottom_3.jpg',
    'bottom_4.jpg'
  ];

  // First 5 images for center slideshow
  const slideshowImages = images.slice(0, 5);
  // Remaining 8 images for surrounding static images
  const surroundingImages = images.slice(5, 13);

  // Auto-slide functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slideshowImages.length);
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(interval);
  }, [slideshowImages.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
            <div className="w-full max-w-8xl mx-auto px-4">
      {/* Main container with tighter grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-2 items-stretch h-82">
        
        {/* Left side images (2 images) */}
        <div className="hidden lg:block lg:col-span-2 space-y-2">
          {surroundingImages.slice(0, 2).map((image, index) => (
            <Link key={`left-${index}`} to="/steam-accounts" className="block">
              <img
                src={`/uploads/${image}`}
                alt={`Game ${index + 1}`}
                className="w-full h-40 object-cover rounded-lg hover:opacity-90 transition-opacity cursor-pointer shadow-lg"
              />
            </Link>
          ))}
        </div>

        {/* Center slideshow - matching height with side images */}
        <div className="col-span-1 lg:col-span-6 relative overflow-hidden rounded-lg shadow-2xl">
          {slideshowImages.map((image, index) => (
            <Link key={index} to="/steam-accounts" className="block">
              <img
                src={`/uploads/${image}`}
                alt={`Slide ${index + 1}`}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 cursor-pointer ${
                  index === currentSlide ? 'opacity-100' : 'opacity-0'
                }`}
              />
            </Link>
          ))}
          
          {/* Slide indicators */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
            {slideshowImages.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide 
                    ? 'bg-white scale-110' 
                    : 'bg-white/50 hover:bg-white/75'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Right side images (2 images) */}
        <div className="hidden lg:block lg:col-span-2 space-y-2">
          {surroundingImages.slice(2, 4).map((image, index) => (
            <Link key={`right-${index}`} to="/steam-accounts" className="block">
              <img
                src={`/uploads/${image}`}
                alt={`Game ${index + 5}`}
                className="w-full h-40 object-cover rounded-lg hover:opacity-90 transition-opacity cursor-pointer shadow-lg"
              />
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom row spanning full width - outside the main grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
        {surroundingImages.slice(4, 8).map((image, index) => (
          <Link key={`bottom-${index}`} to="/steam-accounts" className="block">
            <img
              src={`/uploads/${image}`}
              alt={`Game ${index + 3}`}
              className="w-full h-24 md:h-32 object-cover rounded-lg hover:opacity-90 transition-opacity cursor-pointer shadow-md"
            />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default GameSlideshow; 
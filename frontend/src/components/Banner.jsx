import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

const Banner = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const navItems = [
    {
      label: 'Tất Cả Tài Khoản Steam',
      path: '/steam-accounts',
      description: 'All Steam Accounts'
    },
    {
      label: 'Tài Khoản Steam 1 Game',
      path: '/steam-accounts/single-game',
      description: 'Steam Account 1 Game'
    },
    {
      label: 'Tài Khoản Steam Nhiều Game',
      path: '/steam-accounts/multi-game',
      description: 'Steam Account Many Games'
    },
    {
      label: 'Sản Phẩm Ưu Đãi',
      path: '/discounted',
      description: 'Discounted Products'
    },
    {
      label: 'Sản Phẩm Khác',
      path: '/other-products',
      description: 'Other Products'
    }
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isMenuOpen]);

  return (
    <div className="relative z-50" ref={menuRef}>
      <div className="bg-red-800 text-white py-4">
        <div className="container mx-auto px-4">
          <button
            onClick={toggleMenu}
            className="flex items-center space-x-2 hover:bg-red-700 px-3 py-2 rounded transition-colors cursor-pointer"
          >
            <h2 className="text-xl font-bold uppercase">
              TÀI KHOẢN STEAM ONLINE
            </h2>
            <ChevronDown className={`h-5 w-5 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Dropdown Menu */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 z-[100] bg-white border border-gray-200 rounded-b-lg shadow-2xl min-w-64 w-full max-w-sm">
          <nav className="p-4">
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className="block px-4 py-3 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="font-medium">{item.label}</div>
                    <div className="text-sm text-gray-500">{item.description}</div>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
};

export default Banner;

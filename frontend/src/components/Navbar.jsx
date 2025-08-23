import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut, LogIn, UserPlus, Search, ShoppingCart, ChevronDown } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const navItems = [
    {
      label: 'Tất Cả Tài Khoản Steam',
      path: '/steam-accounts'
    },
    {
      label: 'Tài Khoản Steam 1 Game',
      path: '/steam-accounts/single-game'
    },
    {
      label: 'Tài Khoản Steam Nhiều Game',
      path: '/steam-accounts/multi-game'
    },
    {
      label: 'Sản Phẩm Ưu Đãi',
      path: '/discounted'
    },
    {
      label: 'Sản Phẩm Khác',
      path: '/other-products'
    }
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

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
    <>
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="w-full max-w-8xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <img src="/logo.png" alt="GURROSHOP" className="h-12 w-auto" />
            </Link>

            {/* Search Bar */}
            <div className="flex-1 max-w-sm mx-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm"
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                <Button 
                  className="absolute right-1 top-0.5 bg-red-600 hover:bg-red-700 text-white px-2 py-1 h-7"
                  size="sm"
                >
                  <Search className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Right side - Auth & Cart (switched positions) */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Auth (moved to left) */}
              {isAuthenticated ? (
                <div className="flex items-center space-x-1">
                  <Link to="/profile">
                    <Button variant="ghost" size="sm" className="hidden sm:flex p-1">
                      <User className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleLogout}
                    title="Đăng xuất"
                    className="hidden sm:flex p-1"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                  {/* Mobile auth - show text buttons */}
                  <div className="flex sm:hidden items-center space-x-1">
                    <Link to="/profile">
                      <Button variant="ghost" size="sm" className="p-1">
                        <User className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleLogout}
                      className="p-1"
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center">
                  <Link to="/login">
                    <Button variant="ghost" size="sm" className="hidden sm:flex text-xs">
                      <User className="h-4 w-4 mr-1" />
                      Đăng nhập
                    </Button>
                    <Button variant="ghost" size="sm" className="sm:hidden p-1">
                      <User className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              )}
              
              {/* Divider */}
              <div className="w-px h-4 bg-gray-300"></div>
              
              {/* Cart (moved to right) */}
              <Link to="/cart" className="flex items-center space-x-1 text-gray-700 hover:text-red-600 transition-colors">
                <ShoppingCart className="h-4 w-4" />
                <span className="hidden sm:inline text-sm">Giỏ hàng</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Category Dropdown Bar - Fixed below navbar */}
      <div className="relative bg-red-800 text-white sticky top-14 z-40" ref={menuRef}>
        <div className="w-full max-w-8xl mx-auto px-4">
          <div className="relative">
            <button
              onClick={toggleMenu}
              className="flex items-center space-x-2 hover:bg-red-700 px-3 py-3 rounded transition-colors cursor-pointer"
            >
              <h2 className="text-lg font-bold uppercase">
                TÀI KHOẢN STEAM ONLINE
              </h2>
              <ChevronDown className={`h-5 w-5 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu - Positioned relative to the button */}
            {isMenuOpen && (
              <div className="absolute top-full left-0 z-50 bg-white border border-gray-200 rounded-b-lg shadow-2xl w-auto min-w-64">
                <nav className="p-3">
                  <ul className="space-y-1">
                    {navItems.map((item) => (
                      <li key={item.path}>
                        <Link
                          to={item.path}
                          className="block px-4 py-2 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;

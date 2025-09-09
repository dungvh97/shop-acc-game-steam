import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut, LogIn, UserPlus, Search, ShoppingCart, ChevronDown } from 'lucide-react';
import { Button } from './ui/button';
import { safeDisplayName } from '../utils/encoding';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const [searchValue, setSearchValue] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const formatPrice = (price) => {
    try {
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(price || 0));
    } catch {
      return `${price || 0} VND`;
    }
  };

  const handleSearch = () => {
    const query = searchValue.trim();
    if (query.length > 0) {
      navigate(`/steam-accounts?q=${encodeURIComponent(query)}`);
    } else {
      navigate('/steam-accounts');
    }
  };

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
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch();
                    }
                  }}
                />
                <Button 
                  className="absolute right-1 top-0.5 bg-red-600 hover:bg-red-700 text-white px-2 py-1 h-7"
                  size="sm"
                  onClick={handleSearch}
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
                  {/* Desktop: Profile dropdown on hover */}
                  <div 
                    className="relative hidden sm:flex items-center"
                    onMouseEnter={() => setIsProfileOpen(true)}
                    onMouseLeave={() => setIsProfileOpen(false)}
                  >
                    <Link to="/profile">
                      <Button variant="ghost" size="sm" className="p-1">
                        <User className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link to="/profile" className="ml-1">
                      <span className="text-sm max-w-[160px] truncate inline-block align-middle">
                        {safeDisplayName(user?.firstName + " " + user?.lastName + " ") || safeDisplayName(user?.username) || 'Tài khoản'}
                      </span>
                    </Link>

                    {/* Dropdown menu */}
                    {isProfileOpen && (
                      <div className="absolute left-0 top-full mt-0 z-50">
                        <div className="w-56 bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden">
                          <div className="px-4 py-3 border-b">
                            <div className="text-xs text-gray-500">Số dư</div>
                            <div className="text-sm font-semibold text-gray-800">{formatPrice(user?.balance || 0)}</div>
                          </div>
                          <div className="py-1">
                            <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600">Quản lý tài khoản</Link>
                            <Link to="/profile?tab=activity" className="block px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600">Lịch sử đơn hàng</Link>
                            <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600">Thoát</button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Mobile auth - icons only */}
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
              <Link to="/cart" className="flex items-center space-x-1 text-gray-700 hover:text-red-600 transition-colors relative">
                <ShoppingCart className="h-4 w-4" />
                <span className="hidden sm:inline text-sm">Giỏ hàng</span>
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
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

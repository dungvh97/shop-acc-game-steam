import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut, LogIn, UserPlus } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-background border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img src="/logo.png" alt="Gurro Shop" className="w-8 h-8 object-contain" />
            <span className="text-xl font-bold text-foreground">Gurro Shop</span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className="text-foreground hover:text-primary transition-colors"
            >
              Home
            </Link>
            <Link 
              to="/games" 
              className="text-foreground hover:text-primary transition-colors"
            >
              Games
            </Link>
            <Link 
              to="/steam-accounts" 
              className="text-foreground hover:text-primary transition-colors"
            >
              Steam Accounts
            </Link>
          </div>

          {/* Right side - Auth */}
          <div className="flex items-center space-x-2">
            {/* Auth */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <Link to="/profile">
                  <Button variant="ghost" size="icon" className="hidden sm:flex">
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleLogout}
                  title="Đăng xuất"
                  className="hidden sm:flex"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
                {/* Mobile auth - show text buttons */}
                <div className="flex sm:hidden items-center space-x-2">
                  <Link to="/profile">
                    <Button variant="ghost" size="sm">
                      <User className="h-4 w-4 mr-1" />
                      <span className="text-xs">Profile</span>
                    </Button>
                  </Link>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-1" />
                    <span className="text-xs">Logout</span>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="hidden sm:flex">
                    <LogIn className="h-4 w-4 mr-2" />
                    Đăng nhập
                  </Button>
                  <Button variant="ghost" size="sm" className="sm:hidden">
                    <LogIn className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="default" size="sm" className="hidden sm:flex">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Đăng ký
                  </Button>
                  <Button variant="default" size="sm" className="sm:hidden">
                    <UserPlus className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { decodeUserNames } from '../utils/encoding';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const init = async () => {
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        try {
          const res = await axios.get('/api/auth/me');
          // Decode user names to handle encoding issues
          setUser(decodeUserNames(res.data));
        } catch (e) {
          // Invalid token -> clear
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };
    init();
  }, [token]);

  const login = async (username, password) => {
    try {
      const response = await axios.post('/api/auth/login', {
        username,
        password
      });
      
      const { token: newToken, user: userData } = response.data;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      // Decode user names to handle encoding issues
      const decodedUser = decodeUserNames(userData);
      setUser(decodedUser);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      return { success: true, user: decodedUser };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const oauthLogin = async (oauthData) => {
    try {
      const response = await axios.post('/api/auth/oauth/login', oauthData);
      
      const { token: newToken, user: userData } = response.data;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      // Decode user names to handle encoding issues
      const decodedUser = decodeUserNames(userData);
      setUser(decodedUser);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      return { success: true, user: decodedUser };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'OAuth login failed' 
      };
    }
  };

  const sendVerificationCode = async (email) => {
    try {
      const response = await axios.post('/api/auth/send-verification', { email });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to send verification code' 
      };
    }
  };

  const verifyEmail = async (email, verificationCode) => {
    try {
      const response = await axios.post('/api/auth/verify-email', { 
        email, 
        verificationCode 
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Email verification failed' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('/api/auth/register', userData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  const value = {
    user,
    token,
    loading,
    login,
    oauthLogin,
    sendVerificationCode,
    verifyEmail,
    register,
    logout,
    isAuthenticated: !!token
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

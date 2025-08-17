import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { decodeUserNames } from '../utils/encoding';
import { API_BASE_URL } from '../lib/config';

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
          const res = await axios.get(`${API_BASE_URL}/auth/me`);
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
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      username,
      password,
    });
    const { token: newToken, user: userData } = response.data;
    localStorage.setItem('token', newToken);
    setToken(newToken);
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    // Decode user names to handle encoding issues
    setUser(decodeUserNames(userData));
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  };

  const loginWithGoogle = async (oauthData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/oauth/login`, oauthData);
      const { token: newToken, user: userData } = response.data;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      // Decode user names to handle encoding issues
      setUser(decodeUserNames(userData));
      
      return response.data;
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  };

  const sendVerificationEmail = async (email) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/send-verification`, { email });
      return response.data;
    } catch (error) {
      console.error('Send verification email error:', error);
      throw error;
    }
  };

  const verifyEmail = async (email, code) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/verify-email`, {
        email,
        verificationCode: code
      });
      return response.data;
    } catch (error) {
      console.error('Email verification error:', error);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, userData);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    oauthLogin: loginWithGoogle, // Renamed to avoid conflict with new loginWithGoogle
    sendVerificationCode: sendVerificationEmail, // Renamed to avoid conflict with new sendVerificationEmail
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

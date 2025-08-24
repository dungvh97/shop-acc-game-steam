import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from '../hooks/use-toast';
import { API_BASE_URL } from '../lib/config';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const { isAuthenticated, token } = useAuth();
  const { toast } = useToast();

  // Load cart items when user is authenticated
  useEffect(() => {
    if (isAuthenticated && token) {
      loadCartItems();
      loadCartCount();
    } else {
      setCartItems([]);
      setCartCount(0);
    }
  }, [isAuthenticated, token]);

  const loadCartItems = async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/cart/items`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const items = await response.json();
        setCartItems(items);
      } else {
        console.error('Failed to load cart items');
      }
    } catch (error) {
      console.error('Error loading cart items:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCartCount = async () => {
    if (!isAuthenticated) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/cart/count`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setCartCount(data.count);
      }
    } catch (error) {
      console.error('Error loading cart count:', error);
    }
  };

  const addToCart = async (steamAccountId, quantity = 1) => {
    if (!isAuthenticated) {
      toast({
        title: "Yêu cầu đăng nhập",
        description: "Bạn phải đăng nhập để có thể thêm vào giỏ hàng",
        variant: "destructive",
      });
      return false;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/cart/add`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          steamAccountId,
          quantity,
        }),
      });

      if (response.ok) {
        const newItem = await response.json();
        
        // Update cart items
        setCartItems(prevItems => {
          const existingItemIndex = prevItems.findIndex(item => item.steamAccountId === steamAccountId);
          if (existingItemIndex >= 0) {
            const updatedItems = [...prevItems];
            updatedItems[existingItemIndex] = newItem;
            return updatedItems;
          } else {
            return [newItem, ...prevItems];
          }
        });

        // Update cart count
        setCartCount(prevCount => prevCount + 1);

        toast({
          title: "Thành công",
          description: "Đã thêm vào giỏ hàng",
          variant: "default",
        });

        return true;
      } else {
        toast({
          title: "Lỗi",
          description: "Không thể thêm vào giỏ hàng",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Lỗi",
        description: "Không thể thêm vào giỏ hàng",
        variant: "destructive",
      });
      return false;
    }
  };

  const removeFromCart = async (steamAccountId) => {
    if (!isAuthenticated) return;

    try {
      const response = await fetch(`${API_BASE_URL}/cart/remove/${steamAccountId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setCartItems(prevItems => prevItems.filter(item => item.steamAccountId !== steamAccountId));
        setCartCount(prevCount => Math.max(0, prevCount - 1));
        
        toast({
          title: "Thành công",
          description: "Đã xóa khỏi giỏ hàng",
          variant: "default",
        });
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const updateQuantity = async (steamAccountId, quantity) => {
    if (!isAuthenticated) return;

    try {
      const response = await fetch(`${API_BASE_URL}/cart/update`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          steamAccountId,
          quantity,
        }),
      });

      if (response.ok) {
        if (quantity <= 0) {
          setCartItems(prevItems => prevItems.filter(item => item.steamAccountId !== steamAccountId));
          setCartCount(prevCount => Math.max(0, prevCount - 1));
        } else {
          setCartItems(prevItems => 
            prevItems.map(item => 
              item.steamAccountId === steamAccountId 
                ? { ...item, quantity } 
                : item
            )
          );
        }
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated) return;

    try {
      const response = await fetch(`${API_BASE_URL}/cart/clear`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setCartItems([]);
        setCartCount(0);
        
        toast({
          title: "Thành công",
          description: "Đã xóa tất cả sản phẩm khỏi giỏ hàng",
          variant: "default",
        });
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (parseFloat(item.unitPrice) * item.quantity);
    }, 0);
  };

  const value = {
    cartItems,
    cartCount,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    loadCartItems,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

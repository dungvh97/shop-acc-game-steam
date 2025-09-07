import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Trash2, ShoppingCart, Minus, Plus } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/use-toast';
import { BACKEND_CONFIG } from '../lib/config';
import PaymentDialog from '../components/PaymentDialog';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart, getCartTotal, loading } = useCart();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [cartOrders, setCartOrders] = useState([]);

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Yêu cầu đăng nhập",
        description: "Bạn phải đăng nhập để có thể thanh toán",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    if (cartItems.length === 0) {
      toast({
        title: "Giỏ hàng trống",
        description: "Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán",
        variant: "destructive",
      });
      return;
    }

    try {
      const { checkoutCart } = await import('../lib/api');
      const orders = await checkoutCart();
      setCartOrders(orders);
      setShowPaymentDialog(true);
    } catch (error) {
      console.error('Error during checkout:', error);
      toast({
        title: "Lỗi thanh toán",
        description: "Không thể tạo đơn hàng. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  const handlePaymentSuccess = (order) => {
    setShowPaymentDialog(false);
    // Navigate to profile page with activity tab and payment success parameters
    navigate(`/profile?tab=activity&payment=success&orderId=${order.orderId}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Giỏ hàng</h1>
        
        {!isAuthenticated ? (
          <div className="text-center py-12">
            <ShoppingCart className="h-24 w-24 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-600 mb-2">Vui lòng đăng nhập</h2>
            <p className="text-gray-500 mb-6">Bạn cần đăng nhập để xem giỏ hàng</p>
            <Link to="/login">
              <Button>Đăng nhập</Button>
            </Link>
          </div>
        ) : loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Đang tải giỏ hàng...</p>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="h-24 w-24 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-600 mb-2">Giỏ hàng trống</h2>
            <p className="text-gray-500 mb-6">Bạn chưa có sản phẩm nào trong giỏ hàng</p>
            <Link to="/steam-accounts">
              <Button>Tiếp tục mua sắm</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {cartItems.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{item.steamAccountName}</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-600 hover:text-red-700"
                      onClick={() => removeFromCart(item.steamAccountId)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <img 
                        src={BACKEND_CONFIG.getImageUrl(item.steamAccountImageUrl)} 
                        alt={item.steamAccountName} 
                        className="w-16 h-16 object-cover rounded"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div className="w-16 h-16 bg-gray-300 rounded flex items-center justify-center hidden">
                        <svg className="w-8 h-8 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium">{item.steamAccountName}</p>
                        <p className="text-sm text-gray-500">{item.steamAccountDescription}</p>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => updateQuantity(item.steamAccountId, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => updateQuantity(item.steamAccountId, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="font-bold text-lg">
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND'
                        }).format(item.unitPrice * item.quantity)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            <div className="flex justify-between items-center pt-6 border-t">
              <div className="space-y-2">
                <div className="text-xl font-bold">
                  Tổng cộng: {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                  }).format(getCartTotal())}
                </div>
                <Button 
                  variant="outline" 
                  onClick={clearCart}
                  className="text-red-600 hover:text-red-700"
                >
                  Xóa tất cả
                </Button>
              </div>
              <Button size="lg" onClick={handleCheckout}>Thanh toán</Button>
            </div>
          </div>
        )}
      </div>

      {/* Payment Dialog */}
      {showPaymentDialog && cartOrders.length > 0 && (
        <PaymentDialog
          cartOrders={cartOrders}
          isOpen={showPaymentDialog}
          onClose={() => setShowPaymentDialog(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

export default Cart;
 
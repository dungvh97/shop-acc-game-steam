import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useToast } from '../hooks/use-toast';
import { createSteamAccountOrder, checkOrderStatus } from '../lib/api';

const PaymentDialog = ({ account, cartOrders, isOpen, onClose, onSuccess, shouldAutoCreate = false }) => {
  const { toast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes in seconds
  const [pollingInterval, setPollingInterval] = useState(null);
  const hasAutoCreatedRef = useRef(false);

  useEffect(() => {
    console.log('[PaymentDialog] open:', isOpen, 'account:', account?.id, 'shouldAutoCreate:', shouldAutoCreate);
    if (isOpen) {
      if (cartOrders && cartOrders.length > 0) {
        // Handle cart orders
        setOrders(cartOrders);
        setTimeLeft(1800);
      }
    } else {
      hasAutoCreatedRef.current = false;
    }
  }, [isOpen, cartOrders, shouldAutoCreate, account?.id]);

  // Robust auto-create guard: run once when conditions are met
  useEffect(() => {
    if (
      isOpen &&
      account &&
      shouldAutoCreate &&
      !hasAutoCreatedRef.current &&
      orders.length === 0 &&
      !loading
    ) {
      hasAutoCreatedRef.current = true;
      console.log('[PaymentDialog] Triggering auto create order for account', account.id);
      createOrder();
    }
  }, [isOpen, account, shouldAutoCreate, orders.length, loading]);

  useEffect(() => {
    if (orders.length > 0 && orders.some(order => order.status === 'PENDING')) {
      // Start polling for order status
      const interval = setInterval(() => {
        checkOrders();
      }, 5000); // Check every 5 seconds
      setPollingInterval(interval);

      // Start countdown timer
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        clearInterval(interval);
        clearInterval(timer);
      };
    }
  }, [orders]);

  const createOrder = async () => {
    setLoading(true);
    // Show loading toast while creating the order
    toast({ title: 'Đang tạo đơn hàng...', description: 'Vui lòng đợi trong giây lát.' });
    
    try {
      console.log('[PaymentDialog] Creating order for account:', account.id);
      const orderData = await createSteamAccountOrder(account.id);
      setOrders([orderData]);
      setTimeLeft(1800); // Reset timer
    } catch (error) {
      console.error('[PaymentDialog] Error creating order:', error);
      toast({
        title: 'Lỗi tạo đơn hàng',
        description: 'Không thể tạo đơn hàng. Vui lòng thử lại.',
        variant: 'destructive'
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const checkOrders = async () => {
    if (orders.length === 0) return;
    
    try {
      const updatedOrders = await Promise.all(
        orders.map(async (order) => {
          if (order.status === 'PENDING') {
            return await checkOrderStatus(order.orderId);
          }
          return order;
        })
      );
      
      setOrders(updatedOrders);
      
      // Check if all orders are paid
      const allPaid = updatedOrders.every(order => order.status === 'PAID');
      if (allPaid) {
        clearInterval(pollingInterval);
        onSuccess(updatedOrders[0]); // Pass the first order for navigation
      }
    } catch (error) {
      console.error('Error checking order status:', error);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const handleClose = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }
    setOrders([]);
    setTimeLeft(1800);
    onClose();
  };

  if (!isOpen) return null;

  // If auto-creating and no orders yet (or still loading), only show the toast and hide the dialog
  if (shouldAutoCreate && (loading || orders.length === 0)) {
    return null;
  }

  // Do not render the dialog if there are no orders to show
  if (!shouldAutoCreate && orders.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Thanh toán Đơn hàng</span>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              ✕
            </Button>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {orders.length > 0 && (
            <>
              {/* Orders Overview */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">
                  {orders.length === 1 ? 'Tổng quan Đơn hàng' : `Tổng quan Đơn hàng (${orders.length} sản phẩm)`}
                </h3>
                <div className="space-y-3 max-h-40 overflow-y-auto">
                  {orders.map((order, index) => (
                    <div key={order.orderId} className="border rounded p-3 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Đơn hàng #{index + 1}:</span>
                        <span className="font-mono">{order.orderId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tài khoản:</span>
                        <span>{order.accountName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Loại:</span>
                        <span>{order.accountType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Số tiền:</span>
                        <span className="font-bold text-primary">{formatPrice(order.amount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Trạng thái:</span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'PAID' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Tổng số tiền:</span>
                  <span className="text-primary">
                    {formatPrice(orders.reduce((total, order) => total + order.amount, 0))}
                  </span>
                </div>
              </div>

              {/* Payment Section */}
              {orders.some(order => order.status === 'PENDING') && (
                <div className="space-y-4">
                  <div className="text-center">
                    <h4 className="font-semibold mb-2">Quét mã QR để thanh toán</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Thời gian còn lại: <span className="font-mono text-red-600">{formatTime(timeLeft)}</span>
                    </p>
                  </div>
                  
                  <div className="flex justify-center">
                    <img 
                      src={orders.find(order => order.status === 'PENDING')?.qrCodeUrl} 
                      alt="Mã QR thanh toán"
                      className="w-48 h-48 border rounded-lg"
                    />
                  </div>
                  
                  <div className="text-center text-sm text-muted-foreground">
                    <p>Ngân hàng: TPBank</p>
                    <p>Tài khoản: 27727998888</p>
                    <p>Số tiền: {formatPrice(orders.reduce((total, order) => total + order.amount, 0))}</p>
                    <p>Nội dung: {orders.map(order => order.orderId).join(', ')}</p>
                  </div>
                  
                  <div className="text-center">
                    <Button 
                      variant="outline" 
                      onClick={checkOrders}
                      className="w-full"
                    >
                      Kiểm tra Trạng thái Thanh toán
                    </Button>
                  </div>
                </div>
              )}

              {/* Success Section */}
              {orders.every(order => order.status === 'PAID') && (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-green-600 mb-2">Thanh toán thành công!</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Thông tin đăng nhập tài khoản đã sẵn sàng
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <h5 className="font-semibold">Thông tin Đăng nhập Tài khoản</h5>
                    <div className="space-y-3 max-h-40 overflow-y-auto">
                      {orders.map((order, index) => (
                        <div key={order.orderId} className="border rounded p-3 space-y-2 text-sm">
                          <div className="font-semibold">Tài khoản #{index + 1}: {order.accountName}</div>
                          <div className="flex justify-between">
                            <span>Tên đăng nhập:</span>
                            <span className="font-mono bg-gray-100 px-2 py-1 rounded">{order.accountUsername}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Mật khẩu:</span>
                            <span className="font-mono bg-gray-100 px-2 py-1 rounded">{order.accountPassword}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <Button 
                      onClick={() => onSuccess(orders[0])}
                      className="w-full"
                    >
                      Tiếp tục
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentDialog;

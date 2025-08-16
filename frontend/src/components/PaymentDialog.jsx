import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useToast } from '../hooks/use-toast';
import { createSteamAccountOrder, checkOrderStatus } from '../lib/api';

const PaymentDialog = ({ account, isOpen, onClose, onSuccess }) => {
  const { toast } = useToast();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes in seconds
  const [pollingInterval, setPollingInterval] = useState(null);

  useEffect(() => {
    if (isOpen && account) {
      createOrder();
    }
  }, [isOpen, account]);

  useEffect(() => {
    if (order && order.status === 'PENDING') {
      // Start polling for order status
      const interval = setInterval(() => {
        checkOrder();
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
  }, [order]);

  const createOrder = async () => {
    setLoading(true);
    try {
      const orderData = await createSteamAccountOrder(account.id);
      setOrder(orderData);
      setTimeLeft(1800); // Reset timer
    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: 'Error',
        description: 'Failed to create order. Please try again.',
        variant: 'destructive'
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const checkOrder = async () => {
    if (!order) return;
    
    try {
      const updatedOrder = await checkOrderStatus(order.orderId);
      setOrder(updatedOrder);
      
      if (updatedOrder.status === 'PAID') {
        clearInterval(pollingInterval);
        onSuccess(updatedOrder);
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
    setOrder(null);
    setTimeLeft(1800);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Order Payment</span>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              ✕
            </Button>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Creating order...</p>
            </div>
          ) : order ? (
            <>
              {/* Order Overview */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Order Overview</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Order ID:</span>
                    <span className="font-mono">{order.orderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Account:</span>
                    <span>{order.accountName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Type:</span>
                    <span>{order.accountType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Amount:</span>
                    <span className="font-bold text-primary">{formatPrice(order.amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'PAID' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Section */}
              {order.status === 'PENDING' && (
                <div className="space-y-4">
                  <div className="text-center">
                    <h4 className="font-semibold mb-2">Scan QR Code to Pay</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Time remaining: <span className="font-mono text-red-600">{formatTime(timeLeft)}</span>
                    </p>
                  </div>
                  
                  <div className="flex justify-center">
                    <img 
                      src={order.qrCodeUrl} 
                      alt="QR Code for Payment"
                      className="w-48 h-48 border rounded-lg"
                    />
                  </div>
                  
                  <div className="text-center text-sm text-muted-foreground">
                    <p>Bank: TPBank</p>
                    <p>Account: 27727998888</p>
                    <p>Amount: {formatPrice(order.amount)}</p>
                    <p>Description: {order.orderId}</p>
                  </div>
                  
                  <div className="text-center">
                    <Button 
                      variant="outline" 
                      onClick={checkOrder}
                      className="w-full"
                    >
                      Check Payment Status
                    </Button>
                  </div>
                </div>
              )}

              {/* Success Section */}
              {order.status === 'PAID' && (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-green-600 mb-2">Payment Successful!</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Your account credentials are ready
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <h5 className="font-semibold">Account Credentials</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Username:</span>
                        <span className="font-mono bg-gray-100 px-2 py-1 rounded">{order.accountUsername}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Password:</span>
                        <span className="font-mono bg-gray-100 px-2 py-1 rounded">{order.accountPassword}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <Button 
                      onClick={() => onSuccess(order)}
                      className="w-full"
                    >
                      View Order Details
                    </Button>
                  </div>
                </div>
              )}

              {/* Expired Section */}
              {order.status === 'EXPIRED' && (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-red-600">Order Expired</h4>
                  <p className="text-sm text-muted-foreground">
                    The payment time has expired. Please create a new order.
                  </p>
                  <Button onClick={handleClose} className="w-full">
                    Close
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <p>No order data available</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentDialog;

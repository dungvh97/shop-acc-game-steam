import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useToast } from '../hooks/use-toast';
import { getUserBalance, createAndPaySteamAccountOrderWithBalance } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Wallet, QrCode, ArrowRight } from 'lucide-react';

const PaymentConfirmationDialog = ({ 
  account, 
  isOpen, 
  onClose, 
  onProceedWithBalance, 
  onProceedWithQR,
  onPaymentSuccess
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [userBalance, setUserBalance] = useState(0);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      fetchUserBalance();
    }
  }, [isOpen, user]);

  const fetchUserBalance = async () => {
    setBalanceLoading(true);
    try {
      const balanceData = await getUserBalance();
      setUserBalance(Number(balanceData.balance || 0));
    } catch (error) {
      console.error('Error fetching user balance:', error);
      toast({
        title: 'Lỗi tải số dư',
        description: 'Không thể tải số dư tài khoản. Vui lòng thử lại.',
        variant: 'destructive'
      });
    } finally {
      setBalanceLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const accountPrice = account?.price || 0;
  const hasEnoughBalance = userBalance >= accountPrice;

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
  };

  const handleProceed = async () => {
    if (!selectedOption) {
      toast({
        title: 'Vui lòng chọn phương thức thanh toán',
        description: 'Bạn cần chọn một phương thức thanh toán để tiếp tục.',
        variant: 'destructive'
      });
      return;
    }

    if (selectedOption === 'balance' && !hasEnoughBalance) {
      toast({
        title: 'Số dư không đủ',
        description: 'Số dư tài khoản không đủ để thanh toán.',
        variant: 'destructive'
      });
      return;
    }

    if (selectedOption === 'balance') {
      // Handle balance payment directly
      setProcessing(true);
      try {
        toast({
          title: 'Đang xử lý thanh toán...',
          description: 'Vui lòng đợi trong giây lát.'
        });

        const order = await createAndPaySteamAccountOrderWithBalance(account.id);
        
        toast({
          title: 'Thanh toán thành công!',
          description: 'Tài khoản đã được mua thành công bằng số dư.',
        });

        onClose();
        onPaymentSuccess(order);
      } catch (error) {
        console.error('Balance payment error:', error);
        toast({
          title: 'Lỗi thanh toán',
          description: error.message || 'Không thể thanh toán bằng số dư. Vui lòng thử lại.',
          variant: 'destructive'
        });
      } finally {
        setProcessing(false);
      }
    } else {
      // Handle QR payment
      onClose();
      onProceedWithQR();
    }
  };

  const handleDepositClick = () => {
    onClose();
    // Navigate to profile with transaction history tab
    window.location.href = '/profile?tab=transactions';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Xác nhận thanh toán</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Account Info */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Thông tin tài khoản</h3>
            <div className="border rounded p-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Tài khoản:</span>
                <span className="font-semibold">{account?.accountName}</span>
              </div>
              <div className="flex justify-between">
                <span>Loại:</span>
                <span>{account?.accountType}</span>
              </div>
              <div className="flex justify-between">
                <span>Giá:</span>
                <span className="font-bold text-primary">{formatPrice(accountPrice)}</span>
              </div>
            </div>
          </div>

          {/* Payment Options */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Chọn phương thức thanh toán</h3>
            
            {/* Option 1: Balance Payment */}
            <div 
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                selectedOption === 'balance' 
                  ? 'border-primary bg-primary/5' 
                  : hasEnoughBalance 
                    ? 'border-gray-200 hover:border-primary/50' 
                    : 'border-gray-200 opacity-50 cursor-not-allowed'
              }`}
              onClick={() => hasEnoughBalance && handleOptionSelect('balance')}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-full border-2 ${
                  selectedOption === 'balance' 
                    ? 'border-primary bg-primary' 
                    : 'border-gray-300'
                }`}>
                  {selectedOption === 'balance' && (
                    <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                  )}
                </div>
                <Wallet className="w-5 h-5 text-primary" />
                <div className="flex-1">
                  <div className="font-semibold">Thanh toán bằng số dư</div>
                  <div className="text-sm text-muted-foreground">
                    {balanceLoading ? (
                      'Đang tải số dư...'
                    ) : (
                      `Số dư hiện tại: ${formatPrice(userBalance)}`
                    )}
                  </div>
                  {!hasEnoughBalance && !balanceLoading && (
                    <div className="text-sm text-red-600 mt-1">
                      Số dư không đủ để thanh toán
                    </div>
                  )}
                </div>
              </div>
              
              {!hasEnoughBalance && !balanceLoading && (
                <div className="mt-3">
                  <Button 
                    onClick={handleDepositClick}
                    className="w-full"
                  >
                    Nạp tiền
                  </Button>
                </div>
              )}
            </div>

            {/* Option 2: QR Payment */}
            <div 
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                selectedOption === 'qr' 
                  ? 'border-primary bg-primary/5' 
                  : 'border-gray-200 hover:border-primary/50'
              }`}
              onClick={() => handleOptionSelect('qr')}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-full border-2 ${
                  selectedOption === 'qr' 
                    ? 'border-primary bg-primary' 
                    : 'border-gray-300'
                }`}>
                  {selectedOption === 'qr' && (
                    <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                  )}
                </div>
                <QrCode className="w-5 h-5 text-primary" />
                <div className="flex-1">
                  <div className="font-semibold">Thanh toán qua QR</div>
                  <div className="text-sm text-muted-foreground">
                    Quét mã QR để thanh toán
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
            >
              Hủy
            </Button>
            <Button 
              onClick={handleProceed}
              disabled={!selectedOption || (selectedOption === 'balance' && !hasEnoughBalance) || processing}
              className="flex-1"
            >
              {processing ? 'Đang xử lý...' : 'Tiếp tục'}
              {!processing && <ArrowRight className="w-4 h-4 ml-2" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentConfirmationDialog;

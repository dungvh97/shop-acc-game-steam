import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { createWalletDeposit, getWalletDeposit } from '../lib/api';
import { useToast } from '../hooks/use-toast';

const formatPrice = (price) => {
  const amount = Number(price || 0);
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
};

const DepositDialog = ({ isOpen, amount, onClose }) => {
  const [deposit, setDeposit] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1800);
  const { toast } = useToast();

  useEffect(() => {
    if (!isOpen) return;
    let poll;
    let timer;
    const init = async () => {
      try {
        setLoading(true);
        const res = await createWalletDeposit(amount);
        setDeposit(res);
        timer = setInterval(() => {
          setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        poll = setInterval(async () => {
          try {
            if (!res?.depositId) return;
            const upd = await getWalletDeposit(res.depositId);
            setDeposit(upd);
            if (upd.status === 'PAID') {
              clearInterval(poll);
              clearInterval(timer);
              toast({ title: 'Nạp tiền thành công' });
              onClose && onClose();
            }
          } catch (err) {
            clearInterval(poll);
            clearInterval(timer);
            toast({ title: 'Có lỗi xảy ra khi kiểm tra giao dịch' });
            onClose && onClose();
          }
        }, 5000);
      } catch (err) {
        toast({ title: 'Không thể tạo yêu cầu nạp tiền' });
        onClose && onClose();
      } finally {
        setLoading(false);
      }
    };
    init();
    return () => {
      if (poll) clearInterval(poll);
      if (timer) clearInterval(timer);
      setDeposit(null);
      setTimeLeft(1800);
    };
  }, [isOpen, amount]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Nạp tiền vào ví</span>
            <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading && (
            <div className="text-center py-6">Đang tạo yêu cầu nạp...</div>
          )}
          {deposit && (
            <>
              <div className="space-y-2 text-center">
                <p className="text-sm text-muted-foreground">Số tiền cần thanh toán</p>
                <div className="text-2xl font-bold text-primary">{formatPrice(deposit.amount)}</div>
                <p className="text-xs text-muted-foreground">Thời gian còn lại: <span className="font-mono text-red-600">{formatTime(timeLeft)}</span></p>
              </div>

              <div className="space-y-2">
                <p className="text-center font-medium">Quét QR để thanh toán</p>
                <div className="flex justify-center">
                  {deposit.qrCodeUrl ? (
                    <img src={deposit.qrCodeUrl} alt="QR Nạp tiền" className="w-48 h-48 border rounded-lg bg-white" />
                  ) : (
                    <div className="w-48 h-48 border rounded-lg flex items-center justify-center bg-white">
                      <span className="text-xs text-gray-500">Đang tải QR...</span>
                    </div>
                  )}
                </div>
                <div className="text-center text-sm text-muted-foreground">
                  <p>Ngân hàng: TPBank</p>
                  <p>Số tài khoản: 27727998888</p>
                  <p>Nội dung: {deposit.depositId}</p>
                </div>
              </div>
            </>
          )}

          <Button className="w-full" variant="outline" onClick={onClose}>Đóng</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default DepositDialog;



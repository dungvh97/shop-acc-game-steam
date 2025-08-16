import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Copy, Check, X } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const AccountCredentialsModal = ({ isOpen, onClose, orderData }) => {
  const { toast } = useToast();
  const [copiedField, setCopiedField] = React.useState(null);

  if (!isOpen || !orderData) return null;

  const copyToClipboard = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast({
        title: "Đã sao chép",
        description: `${field === 'username' ? 'Tên đăng nhập' : 'Mật khẩu'} đã được sao chép vào clipboard`,
      });
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      toast({
        title: "Lỗi sao chép",
        description: "Không thể sao chép vào clipboard",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl">🎉 Thanh toán thành công!</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            Thông tin tài khoản của bạn
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Account Info */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <h3 className="font-semibold text-green-800 mb-2">
              {orderData.accountName}
            </h3>
            <Badge variant="secondary" className="text-xs">
              {orderData.accountType}
            </Badge>
          </div>

          {/* Credentials */}
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Tên đăng nhập
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={orderData.accountUsername}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(orderData.accountUsername, 'username')}
                  className="h-8 w-8 p-0"
                >
                  {copiedField === 'username' ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Mật khẩu
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="password"
                  value={orderData.accountPassword}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(orderData.accountPassword, 'password')}
                  className="h-8 w-8 p-0"
                >
                  {copiedField === 'password' ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Important Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <h4 className="font-medium text-yellow-800 text-sm mb-1">
              ⚠️ Lưu ý quan trọng
            </h4>
            <ul className="text-xs text-yellow-700 space-y-1">
              <li>• Lưu thông tin này ở nơi an toàn</li>
              <li>• Không chia sẻ với người khác</li>
              <li>• Bạn có thể xem lại thông tin này trong tab "Hoạt động"</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button onClick={onClose} className="flex-1">
              Đã hiểu
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountCredentialsModal;

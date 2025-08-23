import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { useToast } from '../hooks/use-toast';
import { getSteamAccountById } from '../lib/api';
import PaymentDialog from '../components/PaymentDialog';
import { BACKEND_CONFIG } from '../lib/config';

const SteamAccountDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  useEffect(() => {
    const loadAccount = async () => {
      try {
        const accountData = await getSteamAccountById(id);
        setAccount(accountData);
      } catch (error) {
        console.error('Error loading steam account:', error);
        toast({
          title: 'Error',
          description: 'Failed to load steam account details',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    loadAccount();
  }, [id, toast]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-green-100 text-green-800';
      case 'SOLD':
        return 'bg-red-100 text-red-800';
      case 'RESERVED':
        return 'bg-yellow-100 text-yellow-800';
      case 'MAINTENANCE':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type) => {
    const typeLabels = {
      'STEAM_ACCOUNT_ONLINE': 'Steam Online',
      'STEAM_ACCOUNT_OFFLINE': 'Steam Offline',
      'EPIC_ACCOUNT': 'Epic Account',
      'ORIGIN_ACCOUNT': 'Origin Account',
      'UPLAY_ACCOUNT': 'Uplay Account',
      'GOG_ACCOUNT': 'GOG Account',
      'OTHER_ACCOUNT': 'Other Account'
    };
    return typeLabels[type] || type;
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      toast({
        title: "Yêu cầu đăng nhập",
        description: "Bạn phải đăng nhập để có thể mua tài khoản",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }
    
    setShowPaymentDialog(true);
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast({
        title: "Yêu cầu đăng nhập",
        description: "Bạn phải đăng nhập để có thể thêm vào giỏ hàng",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }
    
    // TODO: Implement add to cart functionality
    toast({
      title: "Thành công",
      description: "Đã thêm vào giỏ hàng",
      variant: "default",
    });
  };

  const handlePaymentSuccess = (order) => {
    setShowPaymentDialog(false);
    // Navigate to profile page with activity tab and payment success parameters
    navigate(`/profile?tab=activity&payment=success&orderId=${order.orderId}`);
  };

  if (loading) {
    return (
      <div>
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!account) {
    return (
      <div>
        <div className="container mx-auto px-4 py-6">
          <p className="text-gray-500">Steam account not found.</p>
          <Link to="/steam-accounts" className="underline">Back to Steam Accounts</Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      
      {/* Area 1: Breadcrumbs */}
      <div className="bg-gray-50 py-3">
        <div className="w-full max-w-7xl mx-auto px-4">
          <nav className="flex text-sm text-gray-600">
            <Link to="/" className="hover:text-red-600">Home</Link>
            <span className="mx-2">{'>'}</span>
            <Link to="/steam-accounts" className="hover:text-red-600">Tài khoản Steam Online</Link>
            <span className="mx-2">{'>'}</span>
            <Link to="/steam-accounts" className="hover:text-red-600">Tài Khoản Steam 1 Game</Link>
            <span className="mx-2">{'>'}</span>
            <span className="text-gray-800">{account.name}</span>
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-full max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column - Game Image */}
          <div className="space-y-4">
            {account.games && account.games.length > 0 && (
              <div className="relative">
                <img 
                  src={BACKEND_CONFIG.getImageUrl(account.games[0].imageUrl)} 
                  alt={account.games[0].name} 
                  className="w-full h-96 object-cover rounded-lg shadow-lg"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="w-full h-96 bg-gray-300 rounded-lg shadow-lg flex items-center justify-center" style={{ display: account.games[0].imageUrl ? 'none' : 'flex' }}>
                  <svg className="w-24 h-24 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                </div>
                {account.games[0].name && (
                  <div className="absolute top-4 right-4 bg-white bg-opacity-90 px-3 py-1 rounded text-sm font-semibold text-gray-800">
                    {account.games[0].name.toUpperCase()}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Product Details */}
          <div className="space-y-6">
            
            {/* Area 2: Account Name */}
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{account.name}</h1>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(account.status)}`}>
                  {account.status}
                </span>
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {getTypeLabel(account.accountType)}
                </span>
              </div>
            </div>

            {/* Area 3: Pricing */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                {account.originalPrice && account.originalPrice > account.price && (
                  <span className="text-gray-500 line-through text-lg">
                    {formatPrice(account.originalPrice)}
                  </span>
                )}
                <span className="text-4xl font-bold text-red-600">
                  {formatPrice(account.price)}
                </span>
                {account.discountPercentage > 0 && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-500 text-white">
                    -{account.discountPercentage}%
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500">
                Stock: {account.stockQuantity} available
              </p>
            </div>

            {/* Area 4: Hardcoded Features */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-800">Tài khoản Steam bao gồm</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span>Tài khoản Steam có sẵn game {account.games && account.games.length > 0 ? account.games[0].name : 'game'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span>Đây là tài khoản Steam {account.accountType === 'STEAM_ACCOUNT_OFFLINE' ? 'Offline' : 'Online'} (ngoại tuyến)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span>Chỉ cần đăng nhập và chơi (không chạy file)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span>Khi chơi cần chuyển Steam sang Offline Mode</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span>Lưu save game riêng trên máy tính của bạn</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span>Có quyền sử dụng tài khoản game vĩnh viễn</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span>Chỉ sử dụng chứ không đổi email, mật khẩu</span>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {/* Area 5: Buy Now Button */}
              <Button 
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 text-lg"
                disabled={account.status !== 'AVAILABLE' || account.stockQuantity <= 0}
                onClick={handleBuyNow}
              >
                <div className="text-center">
                  <div className="font-bold">MUA NGAY</div>
                  <div className="text-sm font-normal opacity-90">Siêu Tốc Qua Mobile Banking</div>
                </div>
              </Button>

              {/* Area 6: Add to Cart Button */}
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 text-lg"
                disabled={account.status !== 'AVAILABLE' || account.stockQuantity <= 0}
                onClick={handleAddToCart}
              >
                THÊM VÀO GIỎ
              </Button>
            </div>
          </div>
        </div>

        {/* Area 7: Games Section */}
        {account.games && account.games.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Games Included</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {account.games.map((game) => (
                <Card key={game.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardContent className="p-0">
                    <Link to={`/games/${game.id}`}>
                      <img 
                        src={BACKEND_CONFIG.getImageUrl(game.imageUrl)}
                        alt={game.name}
                        className="w-full h-32 object-cover hover:opacity-90 transition-opacity"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    </Link>
                    <div className="w-full h-32 bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center hidden">
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="p-3">
                      <h3 className="font-semibold text-sm mb-1 truncate" title={game.name}>
                        {game.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {formatPrice(game.price)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          )}
      </div>

      {/* Payment Dialog */}
      <PaymentDialog
        account={account}
        isOpen={showPaymentDialog}
        onClose={() => setShowPaymentDialog(false)}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default SteamAccountDetail;

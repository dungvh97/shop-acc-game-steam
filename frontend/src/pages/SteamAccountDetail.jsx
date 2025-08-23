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

  const handlePaymentSuccess = (order) => {
    setShowPaymentDialog(false);
    // Navigate to profile page with activity tab and payment success parameters
    navigate(`/profile?tab=activity&payment=success&orderId=${order.orderId}`);
  };

  if (loading) {
    return (
      <div>
        <Banner />
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
        <Banner />
        <div className="container mx-auto px-4 py-6">
          <p className="text-gray-500">Steam account not found.</p>
          <Link to="/steam-accounts" className="underline">Back to Steam Accounts</Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Main Content Area - Fixed container width to match header/footer */}
      <div className="w-full max-w-6xl mx-auto px-4 py-8">
        {/* Account Information */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{account.name}</h1>
          <div className="flex items-center gap-2 mb-4">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(account.status)}`}>
              {account.status}
            </span>
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {getTypeLabel(account.accountType)}
            </span>
          </div>
          {account.description && (
            <p className="text-gray-600 mb-4">{account.description}</p>
          )}
        </div>

        {/* Price Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            {account.originalPrice && account.originalPrice > account.price && (
              <span className="text-gray-500 line-through">
                {formatPrice(account.originalPrice)}
              </span>
            )}
            <span className="text-3xl font-bold text-red-600">
              {formatPrice(account.price)}
            </span>
            {account.discountPercentage && account.discountPercentage > 0 && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-500 text-white">
                -{account.discountPercentage}%
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500">
            Stock: {account.stockQuantity} available
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button 
            disabled={account.status !== 'AVAILABLE' || account.stockQuantity <= 0}
            onClick={handleBuyNow}
          >
            Buy Now
          </Button>
        </div>

        {/* Account Information */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-800">Account Information</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Account Name:</span>
              <p className="font-medium">{account.name}</p>
            </div>
            {account.email && (
              <div>
                <span className="text-gray-500">Email:</span>
                <p className="font-medium">{account.email}</p>
              </div>
            )}
            <div>
              <span className="text-gray-500">Account Type:</span>
              <p className="font-medium">{getTypeLabel(account.accountType)}</p>
            </div>
            <div>
              <span className="text-gray-500">Status:</span>
              <p className="font-medium">{account.status}</p>
            </div>
          </div>
        </div>

        {/* Games Section */}
        {account.games && account.games.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-800">Games Included</h3>
            <div className="grid grid-cols-2 gap-2">
              {account.games.map((game) => (
                <div key={game.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  <img 
                    src={BACKEND_CONFIG.getImageUrl(game.imageUrl)} 
                    alt={game.name} 
                    className="w-8 h-8 object-cover rounded"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="w-8 h-8 bg-gray-300 rounded flex items-center justify-center" style={{ display: game.imageUrl ? 'none' : 'flex' }}>
                    <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium">{game.name}</span>
                </div>
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

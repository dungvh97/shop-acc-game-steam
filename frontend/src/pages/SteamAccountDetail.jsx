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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-muted-foreground">Steam account not found.</p>
        <Link to="/steam-accounts" className="underline">Back to Steam Accounts</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Account Image */}
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            {account.imageUrl ? (
                          <img 
              src={BACKEND_CONFIG.getImageUrl(account.imageUrl)} 
              alt={account.name} 
              className="w-full h-[360px] object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div className="w-full h-[360px] bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center" style={{ display: account.imageUrl ? 'none' : 'flex' }}>
              <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
            </div>
          </CardContent>
        </Card>

        {/* Account Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{account.name}</h1>
            <div className="flex items-center gap-2 mb-4">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(account.status)}`}>
                {account.status}
              </span>
              <span className="text-sm text-muted-foreground bg-gray-100 px-2 py-1 rounded">
                {getTypeLabel(account.accountType)}
              </span>
            </div>
            {account.description && (
              <p className="text-muted-foreground mb-4">{account.description}</p>
            )}
          </div>

          {/* Price Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              {account.originalPrice && account.originalPrice > account.price && (
                <span className="text-muted-foreground line-through">
                  {formatPrice(account.originalPrice)}
                </span>
              )}
              <span className="text-3xl font-bold text-primary">
                {formatPrice(account.price)}
              </span>
              {account.discountPercentage && account.discountPercentage > 0 && (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-500 text-white">
                  -{account.discountPercentage}%
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
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
            <h3 className="text-lg font-semibold">Account Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Account Name:</span>
                <p className="font-medium">{account.name}</p>
              </div>
              {account.email && (
                <div>
                  <span className="text-muted-foreground">Email:</span>
                  <p className="font-medium">{account.email}</p>
                </div>
              )}
              <div>
                <span className="text-muted-foreground">Account Type:</span>
                <p className="font-medium">{getTypeLabel(account.accountType)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Status:</span>
                <p className="font-medium">{account.status}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Games Section */}
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

      {/* Back Button */}
      <div className="mt-8">
        <Link to="/steam-accounts">
          <Button variant="outline">← Back to Steam Accounts</Button>
        </Link>
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

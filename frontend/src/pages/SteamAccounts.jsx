import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { Card, CardContent, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useToast } from '../hooks/use-toast';
import { 
  getAvailableSteamAccounts
} from '../lib/api';
import PaymentDialog from '../components/PaymentDialog';
import { BACKEND_CONFIG } from '../lib/config';

const SteamAccounts = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  
  const [allAccounts, setAllAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(12);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);

  // Load all accounts on mount
  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const response = await getAvailableSteamAccounts();
      
      console.log('API response:', response);
      setAllAccounts(response || []);
    } catch (error) {
      console.error('Error loading steam accounts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load steam accounts',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getPageTitle = () => 'Steam Accounts';

  const getPageDescription = () => 'Browse and purchase gaming accounts';

  // Frontend filtering logic
  const filteredAccounts = useMemo(() => {
    let filtered = allAccounts;

    // Filter by search term (case-insensitive)
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(account => {
        // Search in name
        if (account.name?.toLowerCase().includes(searchLower)) {
          return true;
        }
        // Search in description
        if (account.description?.toLowerCase().includes(searchLower)) {
          return true;
        }
        // Search in game names
        if (account.games && account.games.length > 0) {
          return account.games.some(game => 
            game.name?.toLowerCase().includes(searchLower)
          );
        }
        return false;
      });
    }
    
    // Filter by price range
    const min = minPrice !== '' ? Number(minPrice) : null;
    const max = maxPrice !== '' ? Number(maxPrice) : null;
    if (min !== null) {
      filtered = filtered.filter(account => Number(account.price) >= min);
    }
    if (max !== null) {
      filtered = filtered.filter(account => Number(account.price) <= max);
    }

    return filtered;
  }, [allAccounts, searchTerm, minPrice, maxPrice]);

  // Pagination logic
  const totalPages = Math.ceil(filteredAccounts.length / pageSize);
  const startIndex = currentPage * pageSize;
  const endIndex = startIndex + pageSize;
  const currentAccounts = filteredAccounts.slice(startIndex, endIndex);



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
      case 'PRE_ORDER':
        return 'bg-yellow-100 text-yellow-800';
      case 'MAINTENANCE':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(0); // Reset to first page when searching
  };

  const handleMinPriceChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d*$/.test(value)) {
      setMinPrice(value);
      setCurrentPage(0);
    }
  };

  const handleMaxPriceChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d*$/.test(value)) {
      setMaxPrice(value);
      setCurrentPage(0);
    }
  };

  

  const handleBuyNow = (account) => {
    if (!isAuthenticated) {
      toast({
        title: "Yêu cầu đăng nhập",
        description: "Bạn phải đăng nhập để có thể mua tài khoản",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }
    
    setSelectedAccount(account);
    setShowPaymentDialog(true);
  };

  const handleAddToCart = async (account) => {
    if (!isAuthenticated) {
      toast({
        title: "Yêu cầu đăng nhập",
        description: "Bạn phải đăng nhập để có thể thêm vào giỏ hàng",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }
    
    const success = await addToCart(account.id, 1);
    if (success) {
      // Success toast is handled by the cart context
    }
  };

  const handlePaymentSuccess = (order) => {
    setShowPaymentDialog(false);
    setSelectedAccount(null);
    // Navigate to profile page with activity tab and payment success parameters
    navigate(`/profile?tab=activity&payment=success&orderId=${order.orderId}`);
  };

  return (
    <div>
      
      {/* Main Content Area - Fixed container width to match header/footer */}
      <div className="w-full max-w-8xl mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{getPageTitle()}</h1>
              <p className="text-gray-600">
                {getPageDescription()}
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Tìm kiếm tên game"
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full"
              />
            </div>
            <div className="w-full md:w-40">
              <Input
                type="text"
                inputMode="numeric"
                placeholder="Giá từ (VND)"
                value={minPrice}
                onChange={handleMinPriceChange}
                className="w-full"
              />
            </div>
            <div className="w-full md:w-40">
              <Input
                type="text"
                inputMode="numeric"
                placeholder="Giá đến (VND)"
                value={maxPrice}
                onChange={handleMaxPriceChange}
                className="w-full"
              />
            </div>
          </div>

          {/* Accounts Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                  <CardContent className="p-4">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : currentAccounts.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-500 mb-2">
                No steam accounts found
              </h3>
              <p className="text-gray-500">
                Try adjusting your search or filter criteria
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {currentAccounts.map((account) => (
                  <Card key={account.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                    <Link to={`/steam-accounts/${account.id}`} className="block">
                    {/* Account Image */}
                    <div className="relative h-48 bg-gray-100">
                      {account.imageUrl ? (
                        <img
                          src={BACKEND_CONFIG.getImageUrl(account.imageUrl)}
                          alt={account.username}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className="absolute inset-0 flex items-center justify-center text-gray-400" style={{ display: account.imageUrl ? 'none' : 'flex' }}>
                        <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                        </svg>
                      </div>
                      
                      {/* Status Badge */}
                      <div className="absolute top-2 right-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(account.status)}`}>
                          {account.status === 'AVAILABLE' ? 'Available' : 
                           account.status === 'PRE_ORDER' ? 'Pre-Order' : account.status}
                        </span>
                      </div>
                    </div>
                    </Link>

                    <CardContent className="p-4">
                      {/* Username */}
                      <Link to={`/steam-accounts/${account.id}`} className="block">
                        <CardTitle className="text-lg mb-2 hover:text-blue-600 transition-colors">
                          {account.username}
                        </CardTitle>
                      </Link>

                      {/* Description */}
                      {account.description && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {account.description}
                        </p>
                      )}

                      {/* Price */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg font-bold text-red-600">
                          {formatPrice(account.price)}
                        </span>
                        {account.originalPrice && account.originalPrice > account.price && (
                          <span className="text-sm text-gray-500 line-through">
                            {formatPrice(account.originalPrice)}
                          </span>
                        )}
                      </div>

                      {/* Stock */}
                      <div className="text-sm text-gray-500 mb-3">
                        {account.status === 'PRE_ORDER' ? 'Pre-order available' : `Stock: ${account.stockQuantity} available`}
                      </div>

                      {/* Games */}
                      {account.games && account.games.length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs text-gray-500 mb-2">Games included:</p>
                          <div className="flex flex-wrap gap-1">
                            {account.games.slice(0, 3).map((game) => (
                              <span key={game.id} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                {game.name}
                              </span>
                            ))}
                            {account.games.length > 3 && (
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                +{account.games.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button 
                          className="flex-1"
                          disabled={account.status === 'SOLD' || account.status === 'MAINTENANCE'}
                          onClick={() => handleBuyNow(account)}
                        >
                          {account.status === 'PRE_ORDER' ? 'ĐẶT HÀNG' : 'MUA NGAY'}
                        </Button>
                        {account.status === 'AVAILABLE' && (
                          <Button 
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                            onClick={() => handleAddToCart(account)}
                          >
                            THÊM VÀO GIỎ
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

               {/* Pagination */}
               {totalPages > 1 && (
                 <div className="flex justify-center gap-2 mt-8">
                   <Button
                     variant="outline"
                     disabled={currentPage === 0}
                     onClick={() => setCurrentPage(currentPage - 1)}
                   >
                     Previous
                   </Button>
                   <span className="py-2 px-4">
                     Page {currentPage + 1} of {totalPages} ({filteredAccounts.length} total accounts)
                   </span>
                   <Button
                     variant="outline"
                     disabled={currentPage >= totalPages - 1}
                     onClick={() => setCurrentPage(currentPage + 1)}
                   >
                     Next
                   </Button>
                 </div>
               )}
            </>
          )}

          {/* Payment Dialog */}
          <PaymentDialog
            account={selectedAccount}
            isOpen={showPaymentDialog}
            onClose={() => {
              setShowPaymentDialog(false);
              setSelectedAccount(null);
            }}
            onSuccess={handlePaymentSuccess}
          />
        </div>
      </div>
    </div>
  );
};

export default SteamAccounts;



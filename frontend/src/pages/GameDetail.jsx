import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { useToast } from '../hooks/use-toast';
import { transformGame, getSteamAccountsByGameId, getGameById } from '../lib/api';

const GameDetail = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [game, setGame] = useState(null);
  const [relatedAccounts, setRelatedAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingAccounts, setLoadingAccounts] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const json = await getGameById(id);
        setGame(transformGame(json));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  useEffect(() => {
    const loadRelatedAccounts = async () => {
      if (!game) return;
      
      setLoadingAccounts(true);
      try {
        const accounts = await getSteamAccountsByGameId(game.id);
        setRelatedAccounts(accounts || []);
      } catch (error) {
        console.error('Error loading related accounts:', error);
        toast({
          title: 'Error',
          description: 'Failed to load related accounts',
          variant: 'destructive'
        });
      } finally {
        setLoadingAccounts(false);
      }
    };
    
    loadRelatedAccounts();
  }, [game, toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-muted-foreground">Không tìm thấy game.</p>
        <Link to="/games" className="underline">Quay lại danh sách games</Link>
      </div>
    );
  }

  const imageSrc = game.imageUrl?.startsWith('/uploads/') ? `/api${game.imageUrl}` : game.imageUrl;

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
    const typeMap = {
      'STEAM_ACCOUNT_ONLINE': 'Steam Online',
      'STEAM_ACCOUNT_OFFLINE': 'Steam Offline',
      'EPIC_ACCOUNT': 'Epic Account',
      'ORIGIN_ACCOUNT': 'Origin Account',
      'UPLAY_ACCOUNT': 'Uplay Account',
      'GOG_ACCOUNT': 'GOG Account',
      'OTHER_ACCOUNT': 'Other Account'
    };
    return typeMap[type] || type;
  };



  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8">
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <img src={imageSrc} alt={game.name} className="w-full h-[360px] object-cover" />
          </CardContent>
        </Card>
        <div>
          <h1 className="text-3xl font-bold mb-4">{game.name}</h1>
          <p className="text-muted-foreground mb-4">{game.description}</p>
          <div className="flex items-center gap-3 mb-6">
            {game.originalPrice && game.originalPrice > game.price && (
              <span className="text-muted-foreground line-through">{game.originalPrice} VND</span>
            )}
            <span className="text-3xl font-bold text-primary">{game.price} VND</span>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 font-medium">
              Lựa chọn các account bên dưới để mua tài khoản chơi game này
            </p>
          </div>
        </div>
      </div>
      {game.genres && game.genres.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-3">Thể loại</h2>
          <div className="flex flex-wrap gap-2">
            {game.genres.map((g, i) => (
              <span key={i} className="text-xs bg-muted px-2 py-1 rounded">{g}</span>
            ))}
          </div>
        </div>
      )}

      {/* Related Steam Accounts */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Steam Accounts with this Game</h2>
        {loadingAccounts ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-32 bg-gray-200 rounded-t-lg"></div>
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : relatedAccounts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No Steam accounts found with this game</p>
            <Link to="/steam-accounts" className="text-primary hover:underline mt-2 inline-block">
              Browse all Steam accounts
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {relatedAccounts.map((account) => (
              <Card key={account.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <Link to={`/steam-accounts/${account.id}`} className="block">
                  {/* Account Image */}
                  <div className="relative h-32 bg-gray-100">
                    {account.imageUrl ? (
                      <img
                        src={account.imageUrl}
                        alt={account.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400" style={{ display: account.imageUrl ? 'none' : 'flex' }}>
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                      </svg>
                    </div>
                    
                    {/* Status Badge */}
                    <div className="absolute top-2 right-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(account.status)}`}>
                        {account.status}
                      </span>
                    </div>
                    
                    {/* Discount Badge */}
                    {account.discountPercentage !== null && account.discountPercentage !== undefined && account.discountPercentage > 0 && (
                      <div className="absolute top-2 left-2">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-500 text-white">
                          -{account.discountPercentage}%
                        </span>
                      </div>
                    )}
                  </div>
                </Link>

                <CardContent className="p-4">
                  {/* Account Type */}
                  <div className="mb-2">
                    <span className="text-xs text-muted-foreground bg-gray-100 px-2 py-1 rounded">
                      {getTypeLabel(account.accountType)}
                    </span>
                  </div>

                  {/* Username */}
                  <h3 className="font-semibold text-sm mb-2 truncate" title={account.name}>
                    {account.name}
                  </h3>

                  {/* Price */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm font-bold text-primary">
                      {formatPrice(account.price)}
                    </span>
                    {account.originalPrice && account.originalPrice > account.price && (
                      <span className="text-xs text-muted-foreground line-through">
                        {formatPrice(account.originalPrice)}
                      </span>
                    )}
                  </div>

                  {/* Stock */}
                  <div className="text-xs text-muted-foreground mb-3">
                    Stock: {account.stockQuantity} available
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Link to={`/steam-accounts/${account.id}`} className="w-full">
                      <Button 
                        size="sm"
                        className="w-full"
                        disabled={account.status !== 'AVAILABLE' || account.stockQuantity <= 0}
                      >
                        View
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GameDetail;

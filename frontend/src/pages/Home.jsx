import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Star, TrendingUp, Gamepad2, User, Package } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { getAvailableSteamAccounts } from '../lib/api.js';
import { BACKEND_CONFIG } from '../lib/config';
import GameSlideshow from '../components/GameSlideshow';

const Home = () => {
  const [featuredAccounts, setFeaturedAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadFeaturedAccounts = async () => {
      try {
        let accounts = await getAvailableSteamAccounts();
        let list = accounts || [];
        // Take first 10 accounts for display
        setFeaturedAccounts(list.slice(0, 10));
      } catch (error) {
        console.error('Error loading steam accounts:', error);
        setFeaturedAccounts([]);
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedAccounts();
  }, []);

  const SkeletonCard = () => (
    <div className="animate-pulse border rounded-md overflow-hidden">
      <div className="bg-muted h-32 md:h-40 w-full" />
      <div className="p-4 space-y-3">
        <div className="bg-muted h-4 w-3/4 rounded" />
        <div className="bg-muted h-3 w-1/2 rounded" />
      </div>
    </div>
  );

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
  
  if (loading) {
    return (
      <div>
        <div className="py-6 bg-gray-50">
          <div className="w-full max-w-7xl mx-auto px-4">
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Game Slideshow Section */}
      <div className="py-6 bg-gray-50">
        <GameSlideshow />
      </div>
      
      {/* Main Content Area - matching slideshow width */}
      <div className="w-full max-w-7xl mx-auto px-4 py-8">
        {/* Steam Accounts Section */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
            TÀI KHOẢN GAME NỔI BẬT
            <span className="ml-2 text-red-600">🔥</span>
          </h2>
          
          {/* Grid of steam accounts */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {featuredAccounts.map((account) => (
              <Card key={account.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="p-0 relative">
                  <Link to={`/steam-accounts/${account.id}`}>
                    <div className="relative h-32 sm:h-36 bg-gray-100">
                      {account.imageUrl ? (
                        <img 
                          src={BACKEND_CONFIG.getImageUrl(account.imageUrl)}
                          alt={account.username}
                          className="w-full h-full object-cover hover:opacity-90 transition-opacity"
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
                    </div>
                  </Link>
                  {/* Status Badge */}
                  <div className="absolute top-1 right-1">
                    <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${getStatusColor(account.status)}`}>
                      {account.status === 'AVAILABLE' ? 'Available' : account.status}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="p-2 sm:p-3">
                  <Link to={`/steam-accounts/${account.id}`} className="hover:underline">
                    <CardTitle className="line-clamp-2 text-xs sm:text-sm">{account.username}</CardTitle>
                  </Link>
                  <CardDescription className="line-clamp-2 mt-1 text-xs hidden sm:block">
                    {account.description ? account.description.replace(/<[^>]*>/g, '').substring(0, 40) + '...' : 'Steam Account'}
                  </CardDescription>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex flex-col space-y-0.5">
                      {account.originalPrice && account.originalPrice > account.price && (
                        <span className="text-xs text-gray-500 line-through hidden sm:inline">
                          {formatPrice(account.originalPrice)}
                        </span>
                      )}
                      <span className="text-xs sm:text-sm font-bold text-red-600">
                        {formatPrice(account.price)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Stock: {account.stockQuantity}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-2 sm:p-3 pt-0">
                  <Link to={`/steam-accounts/${account.id}`} className="w-full">
                    <Button className="w-full text-xs sm:text-sm py-1.5">View</Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;


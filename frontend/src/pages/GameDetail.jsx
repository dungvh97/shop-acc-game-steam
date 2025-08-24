import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { useToast } from '../hooks/use-toast';
import { transformGame, getSteamAccountsByGameId, getGameById } from '../lib/api';
import { BACKEND_CONFIG } from '../lib/config';

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
      <div className="w-full max-w-8xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="w-full max-w-8xl mx-auto px-4 py-8">
        <p className="text-gray-500">Không tìm thấy game.</p>
        <Link to="/games" className="underline">Quay lại danh sách games</Link>
      </div>
    );
  }

  const imageSrc = BACKEND_CONFIG.getImageUrl(game.imageUrl);

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

  return (
    <div className="w-full max-w-8xl mx-auto px-4 py-8">
      {/* Game Header */}
      <div className="mb-8">
        <Link to="/games" className="text-blue-600 hover:underline mb-4 inline-block">
          ← Quay lại danh sách games
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{game.name}</h1>
        {game.description && (
          <p className="text-gray-600 text-lg">{game.description.replace(/<[^>]*>/g, '')}</p>
        )}
      </div>

      {/* Game Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Game Image */}
        <div className="lg:col-span-2">
          <img 
            src={imageSrc} 
            alt={game.name} 
            className="w-full h-96 object-cover rounded-lg shadow-lg"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div className="w-full h-96 bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center rounded-lg shadow-lg hidden">
            <div className="text-white text-center">
              <div className="text-6xl mb-4">🎮</div>
              <p>Không có hình ảnh</p>
            </div>
          </div>
        </div>

        {/* Game Info */}
        <div className="space-y-6">
          {/* Price */}
          <div className="bg-white p-6 rounded-lg shadow-lg border">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Thông tin giá</h3>
            <div className="space-y-3">
              {game.originalPrice && game.originalPrice > game.price && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Giá gốc:</span>
                  <span className="text-gray-500 line-through">{formatPrice(game.originalPrice)}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Giá hiện tại:</span>
                <span className="text-2xl font-bold text-red-600">{formatPrice(game.price)}</span>
              </div>
              {game.discountPercentage > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Giảm giá:</span>
                  <span className="text-green-600 font-semibold">-{game.discountPercentage}%</span>
                </div>
              )}
            </div>
          </div>

          {/* Game Details */}
          <div className="bg-white p-6 rounded-lg shadow-lg border">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Chi tiết game</h3>
            <div className="space-y-3">
              {game.releaseDate && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Năm phát hành:</span>
                  <span className="text-gray-900">{new Date(game.releaseDate).getFullYear()}</span>
                </div>
              )}
              {game.rating && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Đánh giá:</span>
                  <span className="text-yellow-600 font-semibold">★ {game.rating.toFixed(1)}</span>
                </div>
              )}
              {game.genres && game.genres.length > 0 && (
                <div className="flex justify-between items-start">
                  <span className="text-gray-600">Thể loại:</span>
                  <div className="flex flex-wrap gap-2">
                    {game.genres.map((genre, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Button */}
          <div className="bg-white p-6 rounded-lg shadow-lg border">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-3">
              Lựa chọn các account bên dưới để mua tài khoản chơi game này
            </Button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default GameDetail;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Star, TrendingUp, Gamepad2, User, Package } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { getFeaturedGames, listGamesPage, transformGames } from '../lib/api.js';
import { BACKEND_CONFIG } from '../lib/config';
import GameSlideshow from '../components/GameSlideshow';

const Home = () => {
  const [featuredGames, setFeaturedGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadFeaturedGames = async () => {
      try {
        let games = await getFeaturedGames(10);
        let list = games || [];
        // Fallback: if no featured found, pull from active games grid endpoint
        if (list.length === 0) {
          const pageJson = await listGamesPage(0, 10);
          list = pageJson?.content ?? [];
        }
        const transformedGames = transformGames(list);
        setFeaturedGames(transformedGames);
      } catch (error) {
        console.error('Error loading featured games:', error);
        setFeaturedGames([]);
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedGames();
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
  
  if (loading) {
    return (
      <div>
        <div className="py-6 bg-gray-50">
          <div className="w-full max-w-6xl mx-auto px-4">
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
      <div className="w-full max-w-6xl mx-auto px-4 py-8">
        {/* Discounted Game Accounts Section */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
            TÀI KHOẢN GAME ƯU ĐÃI
            <span className="ml-2 text-red-600">🔥</span>
          </h2>
          
          {/* Grid of discounted games */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {featuredGames.slice(0, 10).map((game) => (
              <Card key={game.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="p-0 relative">
                  <Link to={`/games/${game.id}`}>
                    <img 
                      src={BACKEND_CONFIG.getImageUrl(game.imageUrl)}
                      alt={game.name}
                      className="w-full h-32 sm:h-36 object-cover hover:opacity-90 transition-opacity"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  </Link>
                  <div className="w-full h-32 sm:h-36 bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center hidden">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  {game.discountPercentage > 0 && (
                    <div className="absolute top-1 right-1 bg-red-600 text-white px-1.5 py-0.5 rounded text-xs font-bold">
                      -{game.discountPercentage}%
                    </div>
                  )}
                </CardHeader>
                <CardContent className="p-2 sm:p-3">
                  <Link to={`/games/${game.id}`} className="hover:underline">
                    <CardTitle className="line-clamp-2 text-xs sm:text-sm">{game.name}</CardTitle>
                  </Link>
                  <CardDescription className="line-clamp-2 mt-1 text-xs hidden sm:block">
                    {game.description.replace(/<[^>]*>/g, '').substring(0, 40)}...
                  </CardDescription>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex flex-col space-y-0.5">
                      {game.originalPrice && game.originalPrice > game.price && (
                        <span className="text-xs text-gray-500 line-through hidden sm:inline">
                          {game.originalPrice} VND
                        </span>
                      )}
                      <span className="text-xs sm:text-sm font-bold text-red-600">
                        {game.price} VND
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-yellow-500">
                      <Star className="h-3 w-3 fill-current" />
                      <span className="text-xs">{game.rating?.toFixed(1) || '4.5'}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-2 sm:p-3 pt-0">
                  <Link to={`/games/${game.id}`} className="w-full">
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


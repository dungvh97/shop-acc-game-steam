import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Star, Search, Gamepad2 } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { listGamesPage, searchGamesPage, getGamesByCategoryPage, transformGames } from '../lib/api';
import { BACKEND_CONFIG } from '../lib/config';

const Games = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(12);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const { toast } = useToast();
  const gamesContainerRef = useRef(null);

  const category = searchParams.get('category') || '';
  const free = searchParams.get('free') === '1';

  useEffect(() => {
    const loadGames = async () => {
      setLoading(true);
      try {
        let list = [];
        if (searchQuery) {
          const pageRes = await searchGamesPage(searchQuery, page, size);
          list = pageRes?.content ?? [];
          setTotal(pageRes?.totalElements ?? list.length);
          setHasMore((pageRes?.last === false) || ((page + 1) * size < (pageRes?.totalElements ?? 0)));
        } else if (free) {
          const pageRes = await listGamesPage(page, size);
          const filtered = (pageRes?.content ?? []).filter(p => Number(p.price) === 0);
          list = filtered;
          setTotal(filtered.length);
          setHasMore(false);
        } else if (category) {
          const pageRes = await getGamesByCategoryPage(category, page, size);
          list = pageRes?.content ?? [];
          setTotal(pageRes?.totalElements ?? list.length);
          setHasMore((pageRes?.last === false) || ((page + 1) * size < (pageRes?.totalElements ?? 0)));
        } else {
          const pageRes = await listGamesPage(page, size);
          list = pageRes?.content ?? [];
          setTotal(pageRes?.totalElements ?? list.length);
          setHasMore((pageRes?.last === false) || ((page + 1) * size < (pageRes?.totalElements ?? 0)));
        }
        // Append for lazy load when page > 0
        setGames(prev => page === 0 ? transformGames(list) : [...prev, ...transformGames(list)]);
      } catch (error) {
        console.error('Error loading games:', error);
        setGames([]);
        setTotal(0);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    };
    loadGames();
  }, [searchQuery, category, page, size, free]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchQuery(e.target.search.value);
    setPage(0);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSearchParams({});
    setPage(0);
    setHasMore(true);
  };

  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    const nextPage = page + 1;
    
    try {
      let list = [];
      if (searchQuery) {
        const pageRes = await searchGamesPage(searchQuery, nextPage, size);
        list = pageRes?.content ?? [];
        setHasMore((pageRes?.last === false) || ((nextPage + 1) * size < (pageRes?.totalElements ?? 0)));
      } else if (free) {
        const pageRes = await listGamesPage(nextPage, size);
        const filtered = (pageRes?.content ?? []).filter(p => Number(p.price) === 0);
        list = filtered;
        setHasMore(false);
      } else if (category) {
        const pageRes = await getGamesByCategoryPage(category, nextPage, size);
        list = pageRes?.content ?? [];
        setHasMore((pageRes?.last === false) || ((nextPage + 1) * size < (pageRes?.totalElements ?? 0)));
      } else {
        const pageRes = await listGamesPage(nextPage, size);
        list = pageRes?.content ?? [];
        setHasMore((pageRes?.last === false) || ((nextPage + 1) * size < (pageRes?.totalElements ?? 0)));
      }
      
      setGames(prev => [...prev, ...transformGames(list)]);
      setPage(nextPage);
    } catch (error) {
      console.error('Error loading more games:', error);
      toast({
        title: "Error",
        description: "Failed to load more games",
        variant: "destructive",
      });
    } finally {
      setLoadingMore(false);
    }
  };

  const handleScroll = () => {
    if (gamesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = gamesContainerRef.current;
      if (scrollTop + clientHeight >= scrollHeight - 100 && hasMore && !loadingMore) {
        handleLoadMore();
      }
    }
  };

  useEffect(() => {
    const container = gamesContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [hasMore, loadingMore]);

  if (loading && page === 0) {
    return (
      <div className="w-full max-w-8xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
              <div className="space-y-2">
                <div className="bg-gray-200 h-4 w-3/4 rounded"></div>
                <div className="bg-gray-200 h-4 w-1/2 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-8xl mx-auto px-4 py-8">
      {/* Search and Filters */}
      <div className="mb-8">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input
              name="search"
              placeholder="Tìm kiếm game..."
              defaultValue={searchQuery}
              className="w-full"
            />
          </div>
          <Button type="submit" className="bg-red-600 hover:bg-red-700">
            <Search className="h-4 w-4 mr-2" />
            Tìm kiếm
          </Button>
          {(searchQuery || category || free) && (
            <Button type="button" variant="outline" onClick={clearFilters}>
              Xóa bộ lọc
            </Button>
          )}
        </form>

        {/* Active Filters Display */}
        {(searchQuery || category || free) && (
          <div className="flex flex-wrap gap-2 mb-4">
            {searchQuery && (
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                Tìm kiếm: {searchQuery}
              </span>
            )}
            {category && (
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                Thể loại: {category}
              </span>
            )}
            {free && (
              <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                Miễn phí
              </span>
            )}
          </div>
        )}
      </div>

      {/* Games Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" ref={gamesContainerRef}>
        {games.map((game) => (
          <Card key={game.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardHeader className="p-0 relative">
              <Link to={`/games/${game.id}`}>
                <img 
                  src={BACKEND_CONFIG.getImageUrl(game.imageUrl)}
                  alt={game.name}
                  className="w-full h-48 object-cover hover:opacity-90 transition-opacity"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              </Link>
              <div className="w-full h-48 bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center hidden">
                <Gamepad2 className="w-8 h-8 text-white" />
              </div>
              {game.discountPercentage > 0 && (
                <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">
                  -{game.discountPercentage}%
                </div>
              )}
            </CardHeader>
            <CardContent className="p-4">
              <Link to={`/games/${game.id}`} className="hover:underline">
                <CardTitle className="line-clamp-2 mb-2">{game.name}</CardTitle>
              </Link>
              <CardDescription className="line-clamp-2 mb-3">
                {game.description.replace(/<[^>]*>/g, '').substring(0, 80)}...
              </CardDescription>
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  {game.originalPrice && game.originalPrice > game.price && (
                    <span className="text-sm text-gray-500 line-through">
                      {game.originalPrice} VND
                    </span>
                  )}
                  <span className="text-lg font-bold text-red-600">
                    {game.price} VND
                  </span>
                </div>
                <div className="flex items-center space-x-1 text-yellow-500">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="text-sm">{game.rating?.toFixed(1) || '4.5'}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <Link to={`/games/${game.id}`} className="w-full">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Xem chi tiết
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="text-center mt-8">
          <Button 
            onClick={handleLoadMore} 
            disabled={loadingMore}
            className="bg-red-600 hover:bg-red-700"
          >
            {loadingMore ? 'Đang tải...' : 'Tải thêm'}
          </Button>
        </div>
      )}

      {/* No Results */}
      {!loading && games.length === 0 && (
        <div className="text-center py-12">
          <Gamepad2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Không tìm thấy game</h3>
          <p className="text-gray-500">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc</p>
        </div>
      )}
    </div>
  );
};

export default Games;

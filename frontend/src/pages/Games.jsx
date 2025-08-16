import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Star, Search, Gamepad2 } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { listGamesPage, searchGamesPage, getGamesByCategoryPage, transformGames } from '../lib/api';

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
      
      // Append new games to existing list
      setGames(prev => [...prev, ...transformGames(list)]);
      setPage(nextPage);
    } catch (error) {
      console.error('Error loading more games:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải thêm games. Vui lòng thử lại.",
        variant: "destructive"
      });
    } finally {
      setLoadingMore(false);
    }
  };

  const SkeletonCard = () => (
    <div className="animate-pulse border rounded-md overflow-hidden">
      <div className="bg-muted h-40 w-full" />
      <div className="p-4 space-y-3">
        <div className="bg-muted h-4 w-3/4 rounded" />
        <div className="bg-muted h-3 w-1/2 rounded" />
        <div className="flex items-center justify-between">
          <div className="bg-muted h-4 w-16 rounded" />
          <div className="bg-muted h-4 w-10 rounded" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Games</h1>
        <p className="text-muted-foreground mb-6">
          Khám phá những game tuyệt vời với giá tốt
        </p>

        {/* Search and Filters */}
        <div className="space-y-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              name="search"
              placeholder="Tìm kiếm games..."
              className="flex-1"
              defaultValue={searchQuery}
            />
            <Button type="submit" size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </form>

          {searchQuery && (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Xóa bộ lọc
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-6 flex items-center justify-between">
        <p className="text-muted-foreground">
          {total} game{total !== 1 ? 's' : ''} được tìm thấy
          {searchQuery && ` cho "${searchQuery}"`}
          {free && ' (miễn phí)'}
        </p>
        {/* per-page removed for lazy load UX */}
      </div>

      {/* Games Grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : games.length > 0 ? (
        <>
        <div ref={gamesContainerRef} className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {games.map((game) => (
            <Card key={game.id} className="overflow-hidden">
              <CardHeader className="p-0">
                <Link to={`/games/${game.id}`}>
                  <img 
                    src={game.imageUrl?.startsWith('/uploads/') ? `/api${game.imageUrl}` : game.imageUrl}
                    alt={game.name}
                    className="w-full h-40 object-cover hover:opacity-90 transition-opacity"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                </Link>
                <div className="w-full h-40 bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center hidden">
                  <Gamepad2 className="h-16 w-16 text-white" />
                </div>
                {game.discountPercentage > 0 && (
                  <div className="absolute top-2 right-2 bg-destructive text-destructive-foreground px-2 py-0.5 rounded text-xs font-bold">
                    -{game.discountPercentage}%
                  </div>
                )}
              </CardHeader>
              <CardContent className="p-6">
                <Link to={`/games/${game.id}`} className="hover:underline">
                  <CardTitle className="line-clamp-2">{game.name}</CardTitle>
                </Link>
                <CardDescription className="line-clamp-3 mt-2">
                  {game.description.replace(/<[^>]*>/g, '').substring(0, 80)}...
                </CardDescription>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center space-x-2">
                                      {game.originalPrice && game.originalPrice > game.price && (
                    <span className="text-sm text-muted-foreground line-through">
                      {game.originalPrice} VND
                    </span>
                  )}
                  <span className="text-lg font-bold text-primary">
                    {game.price} VND
                  </span>
                  </div>
                  <div className="flex items-center space-x-1 text-yellow-500">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="text-sm">{game.rating?.toFixed(1) || '4.5'}</span>
                  </div>
                </div>
                {game.releaseDate && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(game.releaseDate).getFullYear()}
                  </p>
                )}
                {game.genres && game.genres.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {game.genres.slice(0, 2).map((genre, index) => (
                      <span key={index} className="text-xs bg-muted px-2 py-1 rounded">
                        {genre}
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter className="p-6 pt-0">
                <Link to={`/games/${game.id}`} className="w-full">
                  <Button className="w-full">View Details</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
        <div className="flex justify-center items-center mt-8">
          <Button variant="outline" disabled={!hasMore || loadingMore} onClick={handleLoadMore}>
            {loadingMore ? 'Đang tải...' : hasMore ? 'Xem thêm' : 'Không còn game nào'}
          </Button>
        </div>
        </>
      ) : (
        <div className="text-center py-12">
          <Gamepad2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Không tìm thấy game nào</h3>
          <p className="text-muted-foreground mb-4">
            Hãy thử điều chỉnh tìm kiếm hoặc bộ lọc
          </p>
          <Button onClick={clearFilters}>
            Xóa bộ lọc
          </Button>
        </div>
      )}
    </div>
  );
};

export default Games;

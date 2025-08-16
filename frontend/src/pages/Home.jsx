import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Star, TrendingUp, Gamepad2, User, Package } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { getFeaturedGames, listGamesPage, transformGames } from '../lib/api.js';

const Home = () => {
  const [featuredGames, setFeaturedGames] = useState([]);
  const [comingSoon, setComingSoon] = useState([]);
  const [newUpdated, setNewUpdated] = useState([]);
  const [freeGames, setFreeGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadFeaturedGames = async () => {
      try {
        let games = await getFeaturedGames(6);
        let list = games || [];
        // Fallback: if no featured found, pull from active games grid endpoint
        if (list.length === 0) {
          const pageJson = await listGamesPage(0, 6);
          list = pageJson?.content ?? [];
        }
        const transformedGames = transformGames(list);
        setFeaturedGames(transformedGames);

        // Coming soon: recent games (page 0)
        const recent = await listGamesPage(0, 6);
        setComingSoon(transformGames(recent?.content ?? []));

        // New update: next page (page 1)
        const next = await listGamesPage(1, 6);
        setNewUpdated(transformGames(next?.content ?? []));

        // Free games: fetch more and filter price = 0
        const freePage = await listGamesPage(0, 24);
        const all = transformGames(freePage?.content ?? []);
        setFreeGames(all.filter(p => Number(p.price) === 0).slice(0, 6));
      } catch (error) {
        console.error('Error loading featured games:', error);
        setFeaturedGames([]);
        setComingSoon([]);
        setNewUpdated([]);
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
      <div className="space-y-8 md:space-y-12">
        <section className="relative bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-12 md:py-16 lg:py-20 rounded-lg">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">
                Welcome to Gurro Shop
              </h1>
              <p className="text-sm md:text-lg mb-6 md:mb-8 max-w-2xl mx-auto">
                Discover premium game accounts, Steam keys, and software licenses at competitive prices
              </p>
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
                <Link to="/games">
                  <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                    Browse Games
                  </Button>
                </Link>
                <Link to="/steam-accounts">
                  <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                    Browse Steam Accounts
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Games Section */}
        <section>
          <div className="container mx-auto px-4">
            <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Featured Games</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-8 md:space-y-12">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-12 md:py-16 lg:py-20 rounded-lg">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">
              Welcome to Gurro Shop
            </h1>
            <p className="text-sm md:text-lg mb-6 md:mb-8 max-w-2xl mx-auto">
              Discover premium game accounts, Steam keys, and software licenses at competitive prices
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
              <Link to="/games">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                  Browse Games
                </Button>
              </Link>
              <Link to="/steam-accounts">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                  Browse Steam Accounts
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Games Section */}
      {featuredGames.length > 0 && (
        <section>
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className="text-xl md:text-2xl font-bold">Featured Games</h2>
              <Link to="/games">
                <Button variant="outline" size="sm" className="text-sm md:text-base">
                  View All
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {featuredGames.map((game) => (
                <Card key={game.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardHeader className="p-0">
                    <Link to={`/games/${game.id}`}>
                      <img 
                        src={game.imageUrl?.startsWith('/uploads/') ? `/api${game.imageUrl}` : game.imageUrl}
                        alt={game.name}
                        className="w-full h-32 md:h-40 object-cover hover:opacity-90 transition-opacity"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    </Link>
                    <div className="w-full h-32 md:h-40 bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center hidden">
                      <Gamepad2 className="h-12 w-12 md:h-16 md:w-16 text-white" />
                    </div>
                    {game.discountPercentage > 0 && (
                      <div className="absolute top-2 right-2 bg-destructive text-destructive-foreground px-2 py-0.5 rounded text-xs font-bold">
                        -{game.discountPercentage}%
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="p-4 md:p-6">
                    <Link to={`/games/${game.id}`} className="hover:underline">
                      <CardTitle className="line-clamp-2 text-sm md:text-base">{game.name}</CardTitle>
                    </Link>
                    <CardDescription className="line-clamp-2 md:line-clamp-3 mt-2 text-xs md:text-sm">
                      {game.description.replace(/<[^>]*>/g, '').substring(0, 60)}...
                    </CardDescription>
                    <div className="flex items-center justify-between mt-3 md:mt-4">
                      <div className="flex flex-col space-y-1">
                        {game.originalPrice && game.originalPrice > game.price && (
                          <span className="text-xs md:text-sm text-muted-foreground line-through">
                            {game.originalPrice} VND
                          </span>
                        )}
                        <span className="text-sm md:text-lg font-bold text-primary">
                          {game.price} VND
                        </span>
                      </div>
                      <div className="flex items-center space-x-1 text-yellow-500">
                        <Star className="h-3 w-3 md:h-4 md:w-4 fill-current" />
                        <span className="text-xs md:text-sm">{game.rating?.toFixed(1) || '4.5'}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 md:p-6 pt-0">
                    <Link to={`/games/${game.id}`} className="w-full">
                      <Button className="w-full text-sm md:text-base">View Details</Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Free Games Section */}
      {freeGames.length > 0 && (
        <section>
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className="text-xl md:text-2xl font-bold">Free Games</h2>
              <Link to="/games?free=1">
                <Button variant="outline" size="sm" className="text-sm md:text-base">
                  View All
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {freeGames.map((game) => (
                <Card key={game.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardHeader className="p-0">
                    <Link to={`/games/${game.id}`}>
                      <img 
                        src={game.imageUrl?.startsWith('/uploads/') ? `/api${game.imageUrl}` : game.imageUrl}
                        alt={game.name}
                        className="w-full h-32 md:h-40 object-cover hover:opacity-90 transition-opacity"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    </Link>
                    <div className="w-full h-32 md:h-40 bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center hidden">
                      <Gamepad2 className="h-12 w-12 md:h-16 md:w-16 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 md:p-6">
                    <Link to={`/games/${game.id}`} className="hover:underline">
                      <CardTitle className="line-clamp-2 text-sm md:text-base">{game.name}</CardTitle>
                    </Link>
                    <CardDescription className="line-clamp-2 md:line-clamp-3 mt-2 text-xs md:text-sm">
                      {game.description.replace(/<[^>]*>/g, '').substring(0, 60)}...
                    </CardDescription>
                    <div className="flex items-center justify-between mt-3 md:mt-4">
                      <div className="flex flex-col space-y-1">
                        <span className="text-sm md:text-lg font-bold text-green-600">
                          FREE
                        </span>
                      </div>
                      <div className="flex items-center space-x-1 text-yellow-500">
                        <Star className="h-3 w-3 md:h-4 md:w-4 fill-current" />
                        <span className="text-xs md:text-sm">{game.rating?.toFixed(1) || '4.5'}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 md:p-6 pt-0">
                    <Link to={`/games/${game.id}`} className="w-full">
                      <Button className="w-full text-sm md:text-base">Get Free</Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;


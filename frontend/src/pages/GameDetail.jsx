import React, { useEffect, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';

import { transformGame, getGameById, getSteamAccountById } from '../lib/api';
import { BACKEND_CONFIG } from '../lib/config';
import Breadcrumbs from '../components/Breadcrumbs';

const GameDetail = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();

  const [game, setGame] = useState(null);
  const [steamAccount, setSteamAccount] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user came from Steam Account Detail page
  const fromSteamAccount = searchParams.get('fromSteamAccount');
  const steamAccountId = searchParams.get('steamAccountId');

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
    const loadSteamAccount = async () => {
      if (fromSteamAccount && steamAccountId) {
        try {
          const accountData = await getSteamAccountById(steamAccountId);
          setSteamAccount(accountData);
        } catch (error) {
          console.error('Error loading steam account:', error);
        }
      }
    };
    loadSteamAccount();
  }, [fromSteamAccount, steamAccountId]);

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
        {fromSteamAccount && steamAccountId && (
          <Link to={`/steam-accounts/${steamAccountId}`} className="underline">
            Quay lại Steam Account Detail
          </Link>
        )}
      </div>
    );
  }

  const imageSrc = BACKEND_CONFIG.getImageUrl(game.imageUrl);



  return (
    <div>
      {/* Breadcrumbs */}
      {fromSteamAccount && steamAccountId && (
        <div className="bg-gray-50 py-3 mb-6 rounded-lg">
          <div className="w-full max-w-8xl mx-auto px-4">
            <Breadcrumbs 
              accountType={steamAccount?.accountType} 
              accountId={steamAccountId}
              isGameDetail={true}
              accountName={steamAccount?.name}
              gameName={game?.name || 'Game'}
            />
          </div>
        </div>
      )}
      
      <div className="w-full max-w-8xl mx-auto px-4 py-8">


        {/* Game Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{game.name}</h1>
        </div>

        {/* Game Content */}
        <div className="max-w-4xl mx-auto">
          {/* Game Image */}
          <div className="mb-8">
            <img 
              src={imageSrc} 
              alt={game.name} 
              className="w-full h-96 object-contain rounded-lg shadow-lg bg-gray-100"
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

          {/* Game Description */}
          {game.description && (
            <div className="bg-white p-6 rounded-lg shadow-lg border">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Mô tả game</h3>
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  {game.description.replace(/<[^>]*>/g, '')}
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default GameDetail;

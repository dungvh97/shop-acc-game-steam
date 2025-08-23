import React, { useMemo, useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { useAuth } from '../contexts/AuthContext';
import { createGame, uploadImage } from '../lib/api';
import { useToast } from '../hooks/use-toast';
import SteamAccountManager from '../components/SteamAccountManager';

const Admin = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const isAdmin = isAuthenticated && user?.role === 'ADMIN';
  const categories = useMemo(() => [
    'GAME_KEY',
    'STEAM_ACCOUNT_ONLINE',
    'STEAM_ACCOUNT_OFFLINE',
    'ENTERTAINMENT_SOFTWARE',
    'UTILITY_SOFTWARE'
  ], []);
  const types = useMemo(() => [
    'STEAM_KEY','EPIC_KEY','ORIGIN_KEY','UPLAY_KEY','GOG_KEY','OTHER_KEY'
  ], []);

  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    category: 'GAME_KEY',
    type: 'STEAM_KEY',
    imageUrl: '',
    featured: false,
    active: true
  });

  const [activeTab, setActiveTab] = useState('steam-accounts');
  
  // File upload state for game creation
  const [selectedGameFile, setSelectedGameFile] = useState(null);
  const [uploadingGameImage, setUploadingGameImage] = useState(false);

  const guard = () => {
    if (!isAdmin) {
      toast({ title: 'Không được phép', description: 'Yêu cầu quyền admin', variant: 'destructive' });
      return false;
    }
    return true;
  };

  const handleGameFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid file type',
          description: 'Please select an image file (JPEG, PNG, GIF, etc.)',
          variant: 'destructive'
        });
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Please select an image smaller than 5MB',
          variant: 'destructive'
        });
        return;
      }
      
      setSelectedGameFile(file);
    }
  };

  const handleGameImageUpload = async () => {
    if (!selectedGameFile) {
      return null;
    }

    setUploadingGameImage(true);
    try {
      const uploadResponse = await uploadImage(selectedGameFile, 'games');
      toast({
        title: 'Image uploaded successfully',
        description: 'Image has been uploaded and saved',
      });
      return uploadResponse.url;
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload image',
        variant: 'destructive'
      });
      return null;
    } finally {
      setUploadingGameImage(false);
    }
  };

  const handleCreateGame = async (event) => {
    event.preventDefault();
    
    if (!guard()) return;

    if (!newProduct.name || !newProduct.description) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    try {
      let imageUrl = newProduct.imageUrl;
      
      // Upload image if file is selected
      if (selectedGameFile) {
        imageUrl = await handleGameImageUpload();
        if (!imageUrl) return;
      }

      const gameData = {
        ...newProduct,
        imageUrl: imageUrl || ''
      };

      await createGame(gameData);
      
      toast({
        title: 'Game created successfully',
        description: 'New game has been added to the system',
      });

      // Reset form
      setNewProduct({
        name: '',
        description: '',
        category: 'GAME_KEY',
        type: 'STEAM_KEY',
        imageUrl: '',
        featured: false,
        active: true
      });
      setSelectedGameFile(null);
      
    } catch (error) {
      toast({
        title: 'Failed to create game',
        description: error.message || 'An error occurred while creating the game',
        variant: 'destructive'
      });
    }
  };

  if (!isAdmin) {
    return (
      <div className="w-full max-w-8xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-8xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Manage games, steam accounts, and system settings</p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-8">
        <button
          onClick={() => setActiveTab('steam-accounts')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'steam-accounts'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Steam Accounts
        </button>
        <button
          onClick={() => setActiveTab('games')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'games'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Games
        </button>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'steam-accounts' && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Steam Account Management</h2>
          <SteamAccountManager />
        </div>
      )}

      {activeTab === 'games' && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Create New Game</h2>
          
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle>Game Information</CardTitle>
              <CardDescription>Add a new game to the system</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateGame} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Game Name *
                  </label>
                  <Input
                    id="name"
                    type="text"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                    placeholder="Enter game name"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    id="description"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                    placeholder="Enter game description"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      id="category"
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <select
                      id="type"
                      value={newProduct.type}
                      onChange={(e) => setNewProduct({...newProduct, type: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      {types.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
                    Image URL
                  </label>
                  <Input
                    id="imageUrl"
                    type="url"
                    value={newProduct.imageUrl}
                    onChange={(e) => setNewProduct({...newProduct, imageUrl: e.target.value})}
                    placeholder="Enter image URL (optional)"
                  />
                </div>

                <div>
                  <label htmlFor="imageFile" className="block text-sm font-medium text-gray-700 mb-1">
                    Or Upload Image File
                  </label>
                  <Input
                    id="imageFile"
                    type="file"
                    accept="image/*"
                    onChange={handleGameFileSelect}
                    className="w-full"
                  />
                  {selectedGameFile && (
                    <p className="text-sm text-gray-500 mt-1">
                      Selected: {selectedGameFile.name}
                    </p>
                  )}
                </div>

                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newProduct.featured}
                      onChange={(e) => setNewProduct({...newProduct, featured: e.target.checked})}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Featured Game</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newProduct.active}
                      onChange={(e) => setNewProduct({...newProduct, active: e.target.checked})}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Active</span>
                  </label>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-red-600 hover:bg-red-700"
                  disabled={uploadingGameImage}
                >
                  {uploadingGameImage ? 'Creating...' : 'Create Game'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Admin;



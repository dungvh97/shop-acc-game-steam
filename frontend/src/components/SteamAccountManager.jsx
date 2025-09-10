import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Input } from './ui/input';
import { useToast } from '../hooks/use-toast';
import {
  getSteamAccountsAdmin,
  createSteamAccount,
  updateSteamAccount,
  deleteSteamAccount,
  updateSteamAccountStatus,
  getSteamAccountStats,
  searchSteamAccountsAdmin,
  getGames,
  getGameNames,
  uploadImage
} from '../lib/api';
import { BACKEND_CONFIG } from '../lib/config';

// Game Selector Component
const GameSelector = ({ 
  games, 
  selectedGameIds, 
  onSelectGames, 
  loading,
  error 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredGames, setFilteredGames] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef(null);

  // Client-side filtering based on search term
  useEffect(() => {
    if (!Array.isArray(games)) {
      setFilteredGames([]);
      return;
    }
    
    if (searchTerm.trim() === '') {
      // If no search term, show first 20 games
      setFilteredGames(games.slice(0, 20));
    } else {
      // Filter games by name (case-insensitive)
      const filtered = games.filter(game => 
        game.name && game.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredGames(filtered.slice(0, 50)); // Limit to 50 results
    }
  }, [searchTerm, games]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.game-dropdown-container')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Get selected games from both the filtered results and the original games list
  const selectedGames = selectedGameIds.map(gameId => {
    // First try to find in filtered games (from search results)
    const filteredGame = filteredGames.find(g => g.id === gameId);
    if (filteredGame) return filteredGame;
    
    // If not found in filtered games, try to find in original games list
    const originalGame = Array.isArray(games) ? games.find(g => g.id === gameId) : null;
    return originalGame;
  }).filter(Boolean); // Remove any undefined entries

  const handleClearSelection = () => {
    onSelectGames([]);
    setSearchTerm('');
  };

  const handleGameSelect = (gameId) => {
    const newSelectedIds = selectedGameIds.includes(gameId)
      ? selectedGameIds.filter(id => id !== gameId)
      : [...selectedGameIds, gameId];
    onSelectGames(newSelectedIds);
  };

  const handleRemoveGame = (gameId) => {
    const newSelectedIds = selectedGameIds.filter(id => id !== gameId);
    onSelectGames(newSelectedIds);
  };

  return (
    <div className="w-full">
      <label className="text-sm font-medium">Game *</label>
      <div className="relative game-dropdown-container" style={{ position: 'relative', width: '100%', isolation: 'isolate' }}>
        <Input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          placeholder={loading ? "Loading games..." : "Search and select games..."}
          className={`w-full pr-10 ${error ? 'border-red-500 focus:border-red-500' : ''}`}
        />
        
                 {/* Action Buttons */}
         <div className="absolute right-0 top-0 h-full flex items-center pr-2">
           {selectedGameIds.length > 0 && (
             <button
               type="button"
               className="w-6 h-6 flex items-center justify-center border border-gray-300 border-r-0 bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-800 transition-colors rounded-l"
               onClick={handleClearSelection}
             >
               ✕
             </button>
           )}
           <button
             type="button"
             className="w-6 h-6 flex items-center justify-center border border-gray-300 bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-800 transition-colors rounded-r"
             onClick={() => setShowDropdown(!showDropdown)}
           >
             {showDropdown ? '▼' : '▲'}
           </button>
         </div>

        {/* Dropdown */}
        {showDropdown && (
          <div 
            className="absolute z-10 bg-white border rounded shadow-lg mt-1 max-h-48 overflow-y-auto"
            style={{ 
              left: '0', 
              right: '0',
              position: 'absolute',
              top: '100%'
            }}
          >
            {loading ? (
              <div className="p-2 text-gray-500 text-sm">Loading games...</div>
            ) : !Array.isArray(filteredGames) || filteredGames.length === 0 ? (
              <div className="p-2 text-gray-500 text-sm">
                {searchTerm.trim() ? 'No games found matching your search' : 'No games available'}
              </div>
            ) : (
              <>
                {filteredGames.map(game => (
                  <div
                    key={game.id}
                    className={`p-2 cursor-pointer hover:bg-gray-100 border-b last:border-b-0 ${
                      selectedGameIds.includes(game.id) ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => handleGameSelect(game.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-sm truncate">{game.name}</div>
                      {selectedGameIds.includes(game.id) && (
                        <div className="text-blue-600 text-xs">✓</div>
                      )}
                    </div>
                  </div>
                ))}
                {searchTerm.trim() && filteredGames.length === 50 && (
                  <div className="p-2 text-xs text-gray-500 bg-gray-50 border-t">
                    Showing first 50 results. Refine your search for more specific results.
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Selected Games Display */}
        {selectedGames.length > 0 && (
          <div className="mt-2 space-y-1">
            <div className="text-xs text-green-600 font-medium">
              Selected Games ({selectedGames.length}):
            </div>
            <div className="flex flex-wrap gap-1">
              {selectedGames.map(game => (
                <div
                  key={game.id}
                  className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs px-2 py-1 rounded"
                >
                  <span>{game.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveGame(game.id)}
                    className="text-green-600 hover:text-green-800"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Validation Error Display */}
        {error && (
          <div className="mt-2">
            <div className="text-xs text-red-600 font-medium">
              {error}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const SteamAccountManager = () => {
  const { toast } = useToast();
  
  // Account management state
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({});
  
  // Form state
  const [editingAccount, setEditingAccount] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    password: '',
    steamGuard: '',
    accountType: 'MULTI_GAMES',
    status: 'AVAILABLE',
    price: '',
    originalPrice: '',
    discountPercentage: '',
    imageUrl: '',
    stockQuantity: 0,
    description: '',
    gameIds: []
  });
  
  // Validation state
  const [validationErrors, setValidationErrors] = useState({});
  
  // Games state
  const [games, setGames] = useState([]);
  const [gamesLoading, setGamesLoading] = useState(false);
  
  // File upload state
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const accountTypes = [
    'MULTI_GAMES',
    'ONE_GAME',
    'DISCOUNTED',
    'OTHER_ACCOUNT'
  ];

  const accountStatuses = [
    'AVAILABLE',
    'SOLD',
    'PRE_ORDER',
    'MAINTENANCE'
  ];

  // Load data on mount and when page/search changes
  useEffect(() => {
    loadAccounts();
    loadStats();
    loadGames();
  }, [currentPage, searchTerm]);

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const response = searchTerm 
        ? await searchSteamAccountsAdmin(searchTerm, currentPage, 10)
        : await getSteamAccountsAdmin(currentPage, 10);
      
      setAccounts(response.content || response);
      setTotalPages(response.totalPages || 0);
    } catch (error) {
      toast({
        title: 'Error loading accounts',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await getSteamAccountStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadGames = async () => {
    setGamesLoading(true);
    try {
      const gamesData = await getGameNames();
      // The new API returns only id and name
      const gamesArray = Array.isArray(gamesData) ? gamesData : [];
      setGames(gamesArray);
    } catch (error) {
      console.error('Error loading games:', error);
      setGames([]);
    } finally {
      setGamesLoading(false);
    }
  };

  const handleFileSelect = (event) => {
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
      
      setSelectedFile(file);
      // Clear any previous image URL validation errors
      if (validationErrors.imageUrl) {
        setValidationErrors({...validationErrors, imageUrl: null});
      }
    }
  };

  const handleImageUpload = async () => {
    if (!selectedFile) {
      return null;
    }

    setUploadingImage(true);
    try {
      const uploadResponse = await uploadImage(selectedFile);
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
      setUploadingImage(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    
    // Validate Game field
    if (!formData.gameIds || formData.gameIds.length === 0) {
      errors.gameIds = 'Please select at least one game';
    } else {
      // Validate that all selected game IDs exist in the games list
      const validGameIds = games.map(game => game.id);
      const invalidGameIds = formData.gameIds.filter(gameId => !validGameIds.includes(gameId));
      
      if (invalidGameIds.length > 0) {
        errors.gameIds = 'Some selected games are not valid. Please select games from the dropdown.';
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors before submitting.',
        variant: 'destructive'
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Upload image if a file is selected
      let imageUrl = formData.imageUrl;
      if (selectedFile && !editingAccount) {
        imageUrl = await handleImageUpload();
        if (!imageUrl) {
          // Upload failed, don't proceed with account creation
          return;
        }
      }

      const payload = {
        ...formData,
        price: Number(formData.price),
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : null,
        discountPercentage: formData.discountPercentage ? Number(formData.discountPercentage) : 0,
        stockQuantity: Number(formData.stockQuantity),
        status: formData.status,
        imageUrl: imageUrl
      };

      if (editingAccount) {
        await updateSteamAccount(editingAccount.id, payload);
        toast({ title: 'Account updated successfully' });
      } else {
        await createSteamAccount(payload);
        toast({ title: 'Account created successfully' });
      }
      
      resetForm();
      loadAccounts();
      loadStats();
    } catch (error) {
      try {
        // Try to parse the error as JSON to handle structured errors
        const errorData = JSON.parse(error.message);
        
        if (errorData.type === 'validation' && errorData.errors) {
          // Handle validation errors from backend
          setValidationErrors(errorData.errors);
          toast({
            title: 'Validation Error',
            description: 'Please fix the highlighted errors below.',
            variant: 'destructive'
          });
        } else {
          // Handle other API errors
          toast({
            title: 'Error saving account',
            description: errorData.message || 'An unexpected error occurred',
            variant: 'destructive'
          });
        }
      } catch (parseError) {
        // Fallback for non-JSON errors
        toast({
          title: 'Error saving account',
          description: error.message,
          variant: 'destructive'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this account?')) return;
    
    try {
      await deleteSteamAccount(id);
      toast({ title: 'Account deleted successfully' });
      loadAccounts();
      loadStats();
    } catch (error) {
      toast({
        title: 'Error deleting account',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateSteamAccountStatus(id, newStatus);
      toast({ title: 'Status updated successfully' });
      loadAccounts();
      loadStats();
    } catch (error) {
      toast({
        title: 'Error updating status',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (account) => {
    setEditingAccount(account);
    setFormData({
      username: account.username,
      name: account.name || '',
      password: '', // Don't show password
      steamGuard: account.steamGuard || '',
      accountType: account.accountType,
      status: account.status || 'AVAILABLE',
      price: account.price?.toString() || '',
      originalPrice: account.originalPrice?.toString() || '',
      discountPercentage: account.discountPercentage?.toString() || '',
      imageUrl: account.imageUrl || '',
      stockQuantity: account.stockQuantity?.toString() || '0',
      description: account.description || '',
      gameIds: account.gameIds || (account.gameId ? [account.gameId] : [])
    });
    setValidationErrors({});
    setSelectedFile(null);
  };

  const resetForm = () => {
    setFormData({
      username: '',
      name: '',
      password: '',
      steamGuard: '',
      accountType: 'MULTI_GAMES',
      status: 'AVAILABLE',
      price: '',
      originalPrice: '',
      discountPercentage: '',
      imageUrl: '',
      stockQuantity: 0,
      description: '',
      gameIds: []
    });
    setEditingAccount(null);
    setValidationErrors({});
    setSelectedFile(null);
  };

  return (
    <div className="space-y-6">

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.availableAccounts || 0}</div>
            <div className="text-sm text-muted-foreground">Available</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{stats.soldAccounts || 0}</div>
            <div className="text-sm text-muted-foreground">Sold</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.preOrderAccounts || 0}</div>
            <div className="text-sm text-muted-foreground">Pre-Order</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.maintenanceAccounts || 0}</div>
            <div className="text-sm text-muted-foreground">Maintenance</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search accounts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Button onClick={loadAccounts} disabled={loading}>
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>{editingAccount ? 'Edit Account' : 'Add New Account'}</CardTitle>
        </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Account Name *</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({...formData, name: e.target.value});
                      if (validationErrors.name) {
                        setValidationErrors({...validationErrors, name: null});
                      }
                    }}
                    required
                    className={validationErrors.name ? 'border-red-500 focus:border-red-500' : ''}
                  />
                  {validationErrors.name && (
                    <div className="text-xs text-red-600 mt-1">{validationErrors.name}</div>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">Username *</label>
                  <Input
                    value={formData.username}
                    onChange={(e) => {
                      setFormData({...formData, username: e.target.value});
                      if (validationErrors.username) {
                        setValidationErrors({...validationErrors, username: null});
                      }
                    }}
                    required
                    className={validationErrors.username ? 'border-red-500 focus:border-red-500' : ''}
                  />
                  {validationErrors.username && (
                    <div className="text-xs text-red-600 mt-1">{validationErrors.username}</div>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">Password *</label>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => {
                      setFormData({...formData, password: e.target.value});
                      if (validationErrors.password) {
                        setValidationErrors({...validationErrors, password: null});
                      }
                    }}
                    required={!editingAccount}
                    placeholder={editingAccount ? 'Leave blank to keep current' : ''}
                    className={validationErrors.password ? 'border-red-500 focus:border-red-500' : ''}
                  />
                  {validationErrors.password && (
                    <div className="text-xs text-red-600 mt-1">{validationErrors.password}</div>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">Steam Guard</label>
                  <Input
                    type="text"
                    value={formData.steamGuard}
                    onChange={(e) => {
                      setFormData({...formData, steamGuard: e.target.value});
                      if (validationErrors.steamGuard) {
                        setValidationErrors({...validationErrors, steamGuard: null});
                      }
                    }}
                    className={validationErrors.steamGuard ? 'border-red-500 focus:border-red-500' : ''}
                  />
                  {validationErrors.steamGuard && (
                    <div className="text-xs text-red-600 mt-1">{validationErrors.steamGuard}</div>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">Account Type *</label>
                  <select
                    className={`w-full border rounded h-10 px-3 ${validationErrors.accountType ? 'border-red-500' : ''}`}
                    value={formData.accountType}
                    onChange={(e) => {
                      setFormData({...formData, accountType: e.target.value});
                      if (validationErrors.accountType) {
                        setValidationErrors({...validationErrors, accountType: null});
                      }
                    }}
                    required
                  >
                    {accountTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {validationErrors.accountType && (
                    <div className="text-xs text-red-600 mt-1">{validationErrors.accountType}</div>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">Account Status *</label>
                  <select
                    className={`w-full border rounded h-10 px-3 ${validationErrors.status ? 'border-red-500' : ''}`}
                    value={formData.status}
                    onChange={(e) => {
                      setFormData({...formData, status: e.target.value});
                      if (validationErrors.status) {
                        setValidationErrors({...validationErrors, status: null});
                      }
                    }}
                    required
                  >
                    {accountStatuses.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                  {validationErrors.status && (
                    <div className="text-xs text-red-600 mt-1">{validationErrors.status}</div>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">Price *</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => {
                      setFormData({...formData, price: e.target.value});
                      if (validationErrors.price) {
                        setValidationErrors({...validationErrors, price: null});
                      }
                    }}
                    required
                    className={validationErrors.price ? 'border-red-500 focus:border-red-500' : ''}
                  />
                  {validationErrors.price && (
                    <div className="text-xs text-red-600 mt-1">{validationErrors.price}</div>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">Original Price</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({...formData, originalPrice: e.target.value})}
                    className={validationErrors.originalPrice ? 'border-red-500 focus:border-red-500' : ''}
                  />
                  {validationErrors.originalPrice && (
                    <div className="text-xs text-red-600 mt-1">{validationErrors.originalPrice}</div>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">Discount %</label>
                  <Input
                    type="number"
                    min="0"
                    max="90"
                    value={formData.discountPercentage}
                    onChange={(e) => setFormData({...formData, discountPercentage: e.target.value})}
                    className={validationErrors.discountPercentage ? 'border-red-500 focus:border-red-500' : ''}
                  />
                  {validationErrors.discountPercentage && (
                    <div className="text-xs text-red-600 mt-1">{validationErrors.discountPercentage}</div>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">Stock Quantity *</label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({...formData, stockQuantity: e.target.value})}
                    required
                    className={validationErrors.stockQuantity ? 'border-red-500 focus:border-red-500' : ''}
                  />
                  {validationErrors.stockQuantity && (
                    <div className="text-xs text-red-600 mt-1">{validationErrors.stockQuantity}</div>
                  )}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Account Image</label>
                <div className="space-y-2">
                  {/* File Input */}
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm transition-colors"
                    >
                      {uploadingImage ? 'Uploading...' : 'Choose Image'}
                    </label>
                    {selectedFile && (
                      <span className="text-sm text-gray-600">
                        {selectedFile.name}
                      </span>
                    )}
                  </div>
                  
                  {/* Preview */}
                  {selectedFile && (
                    <div className="mt-2">
                      <img
                        src={URL.createObjectURL(selectedFile)}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded border"
                      />
                    </div>
                  )}
                  
                  {/* Existing Image URL (for editing) */}
                  {editingAccount && formData.imageUrl && !selectedFile && (
                    <div className="mt-2">
                      <label className="text-sm text-gray-600">Current Image:</label>
                      <img
                        src={BACKEND_CONFIG.getImageUrl(formData.imageUrl)}
                        alt="Current"
                        className="w-32 h-32 object-cover rounded border mt-1"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  
                  {/* Manual URL input for editing */}
                  {editingAccount && (
                    <div className="mt-2">
                      <label className="text-sm text-gray-600">Or enter image URL:</label>
                      <Input
                        value={formData.imageUrl}
                        onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                        placeholder="https://..."
                        className={validationErrors.imageUrl ? 'border-red-500 focus:border-red-500' : ''}
                      />
                    </div>
                  )}
                </div>
                {validationErrors.imageUrl && (
                  <div className="text-xs text-red-600 mt-1">{validationErrors.imageUrl}</div>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Account description..."
                  className={validationErrors.description ? 'border-red-500 focus:border-red-500' : ''}
                />
                {validationErrors.description && (
                  <div className="text-xs text-red-600 mt-1">{validationErrors.description}</div>
                )}
              </div>
              
              {/* Game Selection */}
              <GameSelector
                games={games}
                selectedGameIds={formData.gameIds}
                onSelectGames={(gameIds) => {
                  setFormData({...formData, gameIds});
                  // Clear validation error when user selects games
                  if (validationErrors.gameIds) {
                    setValidationErrors({...validationErrors, gameIds: null});
                  }
                }}
                loading={gamesLoading}
                error={validationErrors.gameIds}
              />
              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  {editingAccount ? 'Update' : 'Create'} Account
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

      {/* Accounts List */}
      <Card>
        <CardHeader>
          <CardTitle>Accounts ({accounts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : accounts.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">No accounts found</div>
          ) : (
            <div className="space-y-4">
              {accounts.map((account) => (
                <div key={account.id} className="border rounded p-4">
                  <div className="flex justify-between items-start">
                                         <div className="flex-1">
                       <div className="flex items-start gap-3">
                         {/* Account Image */}
                         {account.imageUrl && (
                           <img
                             src={BACKEND_CONFIG.getImageUrl(account.imageUrl)}
                             alt={account.name}
                             className="w-16 h-16 object-cover rounded border"
                             onError={(e) => {
                               e.target.style.display = 'none';
                             }}
                           />
                         )}
                         
                         <div className="flex-1">
                           <div className="flex items-center gap-2">
                             <h3 className="font-medium">{account.name}</h3>
                             <span className={`px-2 py-1 rounded text-xs ${
                               account.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' :
                               account.status === 'SOLD' ? 'bg-red-100 text-red-800' :
                               account.status === 'PRE_ORDER' ? 'bg-yellow-100 text-yellow-800' :
                               'bg-blue-100 text-blue-800'
                             }`}>
                               {account.status}
                             </span>
                             <span className="px-2 py-1 rounded text-xs bg-gray-100">
                               {account.accountType}
                             </span>
                                                      </div>
                           <p className="text-sm text-muted-foreground mt-1">
                             {account.description || 'No description'}
                           </p>
                           <div className="flex gap-4 mt-2 text-sm">
                             <span>Price: {account.price} VND</span>
                             <span>Stock: {account.stockQuantity}</span>
                             {account.steamGuard && <span>Steam Guard: {account.steamGuard}</span>}
                           </div>
                           {(account.gameIds && account.gameIds.length > 0) && (
                             <div className="mt-2">
                               <span className="text-sm text-blue-600">Games: </span>
                               <div className="flex flex-wrap gap-1 mt-1">
                                 {account.gameIds.map(gameId => {
                                   const game = games.find(g => g.id === gameId);
                                   return game ? (
                                     <span key={gameId} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                       {game.name}
                                     </span>
                                   ) : null;
                                 })}
                               </div>
                             </div>
                           )}
                         </div>
                       </div>
                     </div>
                    <div className="flex gap-2">
                      <select
                        className="text-xs border rounded px-2 py-1"
                        value={account.status}
                        onChange={(e) => handleStatusChange(account.id, e.target.value)}
                      >
                        {accountStatuses.map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                      <Button size="sm" onClick={() => handleEdit(account)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(account.id)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <Button
                variant="outline"
                disabled={currentPage === 0}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Previous
              </Button>
              <span className="py-2 px-4">
                Page {currentPage + 1} of {totalPages}
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
        </CardContent>
      </Card>
    </div>
  );
};

export default SteamAccountManager;

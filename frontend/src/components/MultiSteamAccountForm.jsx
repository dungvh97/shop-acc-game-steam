import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Input } from './ui/input';
import { useToast } from '../hooks/use-toast';
import {
  createSteamAccount,
  getGameNames,
  uploadImage
} from '../lib/api';
import { BACKEND_CONFIG } from '../lib/config';

// Game Selector Component (reused from SteamAccountManager)
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

  // Client-side filtering based on search term
  useEffect(() => {
    if (!Array.isArray(games)) {
      setFilteredGames([]);
      return;
    }
    
    if (searchTerm.trim() === '') {
      setFilteredGames(games.slice(0, 20));
    } else {
      const filtered = games.filter(game => 
        game.name && game.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredGames(filtered.slice(0, 50));
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

  const selectedGames = selectedGameIds.map(gameId => {
    const filteredGame = filteredGames.find(g => g.id === gameId);
    if (filteredGame) return filteredGame;
    
    const originalGame = Array.isArray(games) ? games.find(g => g.id === gameId) : null;
    return originalGame;
  }).filter(Boolean);

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
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          placeholder={loading ? "Đang tải game..." : "Tìm kiếm và chọn game..."}
          className={`w-full pr-10 ${error ? 'border-red-500 focus:border-red-500' : ''}`}
        />
        
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
              <div className="p-2 text-gray-500 text-sm">Đang tải game...</div>
            ) : !Array.isArray(filteredGames) || filteredGames.length === 0 ? (
              <div className="p-2 text-gray-500 text-sm">
                {searchTerm.trim() ? 'Không tìm thấy game phù hợp' : 'Không có game nào'}
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
              </>
            )}
          </div>
        )}

        {selectedGames.length > 0 && (
          <div className="mt-2 space-y-1">
            <div className="text-xs text-green-600 font-medium">
              Game đã chọn ({selectedGames.length}):
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

const MultiSteamAccountForm = () => {
  const { toast } = useToast();
  
  // Form state
  const [accounts, setAccounts] = useState([
    {
      accountCode: '',
      username: '',
      password: '',
      steamGuard: '',
      status: 'AVAILABLE'
    }
  ]);
  
  // Common fields (same for all accounts)
  const [commonFields, setCommonFields] = useState({
    name: '',
    description: '',
    imageUrl: '',
    accountType: 'MULTI_GAMES',
    price: '',
    originalPrice: '',
    discountPercentage: '',
    stockQuantity: 1,
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
  const [submitting, setSubmitting] = useState(false);

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

  // Load games on mount
  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    setGamesLoading(true);
    try {
      const gamesData = await getGameNames();
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
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Loại file không hợp lệ',
          description: 'Vui lòng chọn file hình ảnh (JPEG, PNG, GIF, v.v.)',
          variant: 'destructive'
        });
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File quá lớn',
          description: 'Vui lòng chọn hình ảnh nhỏ hơn 5MB',
          variant: 'destructive'
        });
        return;
      }
      
      setSelectedFile(file);
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
        title: 'Tải lên hình ảnh thành công',
        description: 'Hình ảnh đã được tải lên và lưu',
      });
      return uploadResponse.url;
    } catch (error) {
      toast({
        title: 'Tải lên thất bại',
        description: error.message || 'Không thể tải lên hình ảnh',
        variant: 'destructive'
      });
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const addAccount = () => {
    setAccounts([...accounts, {
      accountCode: '',
      username: '',
      password: '',
      steamGuard: '',
      status: 'AVAILABLE'
    }]);
  };

  const removeAccount = (index) => {
    if (accounts.length > 1) {
      const newAccounts = accounts.filter((_, i) => i !== index);
      setAccounts(newAccounts);
    }
  };

  const updateAccount = (index, field, value) => {
    const newAccounts = [...accounts];
    newAccounts[index][field] = value;
    setAccounts(newAccounts);
  };

  // Auto-generate accounts based on stock quantity
  const generateAccountsFromStock = (stockQuantity) => {
    const newAccounts = [];
    for (let i = 1; i <= stockQuantity; i++) {
      newAccounts.push({
        accountCode: `ACC-${i}`,
        username: '',
        password: '',
        steamGuard: '',
        status: 'AVAILABLE'
      });
    }
    setAccounts(newAccounts);
  };

  // Handle stock quantity change
  const handleStockQuantityChange = (value) => {
    const quantity = parseInt(value) || 0;
    setCommonFields({...commonFields, stockQuantity: quantity});
    
    // Auto-generate accounts if quantity is greater than current accounts
    if (quantity > accounts.length) {
      generateAccountsFromStock(quantity);
    } else if (quantity < accounts.length) {
      // Remove excess accounts
      setAccounts(accounts.slice(0, quantity));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    // Validate common fields
    if (!commonFields.name.trim()) {
      errors.name = 'Tên sản phẩm không được để trống';
    }
    
    if (!commonFields.gameIds || commonFields.gameIds.length === 0) {
      errors.gameIds = 'Vui lòng chọn ít nhất một game';
    }
    
    if (!commonFields.price || commonFields.price <= 0) {
      errors.price = 'Giá phải lớn hơn 0';
    }
    
    if (!commonFields.stockQuantity || commonFields.stockQuantity < 0) {
      errors.stockQuantity = 'Số lượng kho phải lớn hơn hoặc bằng 0';
    }
    
    // Validate individual accounts
    accounts.forEach((account, index) => {
      if (!account.accountCode.trim()) {
        errors[`account_${index}_accountCode`] = 'Mã sản phẩm không được để trống';
      }
      if (!account.username.trim()) {
        errors[`account_${index}_username`] = 'Tên đăng nhập không được để trống';
      }
      if (!account.password.trim()) {
        errors[`account_${index}_password`] = 'Mật khẩu không được để trống';
      } else if (account.password.length < 6) {
        errors[`account_${index}_password`] = 'Mật khẩu phải có ít nhất 6 ký tự';
      }
    });
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: 'Lỗi xác thực',
        description: 'Vui lòng sửa các lỗi trước khi gửi.',
        variant: 'destructive'
      });
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Upload image if a file is selected
      let imageUrl = commonFields.imageUrl;
      if (selectedFile) {
        imageUrl = await handleImageUpload();
        if (!imageUrl) {
          return;
        }
      }

      // Create payload for the new API structure
      const payload = {
        name: commonFields.name,
        description: commonFields.description,
        imageUrl: imageUrl,
        accountType: commonFields.accountType,
        price: commonFields.price,
        originalPrice: commonFields.originalPrice || null,
        discountPercentage: commonFields.discountPercentage ? Number(commonFields.discountPercentage) : 0,
        stockQuantity: Number(commonFields.stockQuantity),
        gameIds: commonFields.gameIds,
        steamAccounts: accounts
      };
        
      await createSteamAccount(payload);
      
      toast({
        title: 'Tạo tài khoản thành công',
        description: `Đã tạo thành công ${accounts.length} tài khoản Steam`,
      });
      
      // Reset form
      setAccounts([{
        accountCode: '',
        username: '',
        password: '',
        steamGuard: '',
        status: 'AVAILABLE'
      }]);
      setCommonFields({
        name: '',
        description: '',
        imageUrl: '',
        accountType: 'MULTI_GAMES',
        price: '',
        originalPrice: '',
        discountPercentage: '',
        stockQuantity: 1,
        gameIds: []
      });
      setSelectedFile(null);
      setValidationErrors({});
      
    } catch (error) {
      console.error('Error creating accounts:', error);
      toast({
        title: 'Lỗi tạo tài khoản',
        description: error.message || 'Đã xảy ra lỗi khi tạo tài khoản',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Thêm nhiều tài khoản Steam</CardTitle>
        <CardDescription>
          Thêm nhiều tài khoản Steam cùng lúc với thông tin chung và thông tin riêng cho từng tài khoản
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Common Fields */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Thông tin chung</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Tên sản phẩm *</label>
                <Input
                  value={commonFields.name}
                  onChange={(e) => setCommonFields({...commonFields, name: e.target.value})}
                  required
                  className={validationErrors.name ? 'border-red-500 focus:border-red-500' : ''}
                />
                {validationErrors.name && (
                  <div className="text-xs text-red-600 mt-1">{validationErrors.name}</div>
                )}
              </div>
              
              <div>
                <label className="text-sm font-medium">Loại Tài khoản *</label>
                <select
                  className={`w-full border rounded h-10 px-3 ${validationErrors.accountType ? 'border-red-500' : ''}`}
                  value={commonFields.accountType}
                  onChange={(e) => setCommonFields({...commonFields, accountType: e.target.value})}
                  required
                >
                  {accountTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Giá *</label>
                <Input
                  type="number"
                  step="0.01"
                  value={commonFields.price}
                  onChange={(e) => setCommonFields({...commonFields, price: e.target.value})}
                  required
                  className={validationErrors.price ? 'border-red-500 focus:border-red-500' : ''}
                />
                {validationErrors.price && (
                  <div className="text-xs text-red-600 mt-1">{validationErrors.price}</div>
                )}
              </div>
              
              <div>
                <label className="text-sm font-medium">Giá gốc</label>
                <Input
                  type="number"
                  step="0.01"
                  value={commonFields.originalPrice}
                  onChange={(e) => setCommonFields({...commonFields, originalPrice: e.target.value})}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Giảm giá %</label>
                <Input
                  type="number"
                  min="0"
                  max="90"
                  value={commonFields.discountPercentage}
                  onChange={(e) => setCommonFields({...commonFields, discountPercentage: e.target.value})}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Số lượng Kho *</label>
                <Input
                  type="number"
                  min="0"
                  value={commonFields.stockQuantity}
                  onChange={(e) => handleStockQuantityChange(e.target.value)}
                  required
                  className={validationErrors.stockQuantity ? 'border-red-500 focus:border-red-500' : ''}
                />
                {validationErrors.stockQuantity && (
                  <div className="text-xs text-red-600 mt-1">{validationErrors.stockQuantity}</div>
                )}
                <div className="text-xs text-gray-500 mt-1">
                  Số lượng này sẽ tự động tạo ra các tài khoản tương ứng
                </div>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium">Hình ảnh Tài khoản</label>
              <div className="space-y-2">
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
                    {uploadingImage ? 'Đang tải lên...' : 'Chọn Hình ảnh'}
                  </label>
                  {selectedFile && (
                    <span className="text-sm text-gray-600">
                      {selectedFile.name}
                    </span>
                  )}
                </div>
                
                {selectedFile && (
                  <div className="mt-2">
                    <img
                      src={URL.createObjectURL(selectedFile)}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded border"
                    />
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium">Mô tả</label>
              <Input
                value={commonFields.description}
                onChange={(e) => setCommonFields({...commonFields, description: e.target.value})}
                placeholder="Mô tả tài khoản..."
              />
            </div>
            
            <GameSelector
              games={games}
              selectedGameIds={commonFields.gameIds}
              onSelectGames={(gameIds) => setCommonFields({...commonFields, gameIds})}
              loading={gamesLoading}
              error={validationErrors.gameIds}
            />
          </div>

          {/* Individual Account Fields */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Thông tin riêng từng tài khoản</h3>
            </div>
            
            {accounts.map((account, index) => (
              <Card key={index} className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium">Tài khoản {index + 1}</h4>
                  {accounts.length > 1 && (
                    <Button 
                      type="button" 
                      onClick={() => removeAccount(index)} 
                      variant="destructive" 
                      size="sm"
                    >
                      Xóa
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Mã sản phẩm *</label>
                    <Input
                      value={account.accountCode}
                      onChange={(e) => updateAccount(index, 'accountCode', e.target.value)}
                      required
                      className={validationErrors[`account_${index}_accountCode`] ? 'border-red-500 focus:border-red-500' : ''}
                    />
                    {validationErrors[`account_${index}_accountCode`] && (
                      <div className="text-xs text-red-600 mt-1">{validationErrors[`account_${index}_accountCode`]}</div>
                    )}
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Tên đăng nhập *</label>
                    <Input
                      value={account.username}
                      onChange={(e) => updateAccount(index, 'username', e.target.value)}
                      required
                      className={validationErrors[`account_${index}_username`] ? 'border-red-500 focus:border-red-500' : ''}
                    />
                    {validationErrors[`account_${index}_username`] && (
                      <div className="text-xs text-red-600 mt-1">{validationErrors[`account_${index}_username`]}</div>
                    )}
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Mật khẩu *</label>
                    <Input
                      type="text"
                      value={account.password}
                      onChange={(e) => updateAccount(index, 'password', e.target.value)}
                      required
                      className={validationErrors[`account_${index}_password`] ? 'border-red-500 focus:border-red-500' : ''}
                    />
                    {validationErrors[`account_${index}_password`] && (
                      <div className="text-xs text-red-600 mt-1">{validationErrors[`account_${index}_password`]}</div>
                    )}
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Steam Guard</label>
                    <Input
                      type="text"
                      value={account.steamGuard}
                      onChange={(e) => updateAccount(index, 'steamGuard', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Trạng thái Tài khoản *</label>
                    <select
                      className="w-full border rounded h-10 px-3"
                      value={account.status}
                      onChange={(e) => updateAccount(index, 'status', e.target.value)}
                      required
                    >
                      {accountStatuses.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={submitting || uploadingImage}>
              {submitting ? 'Đang tạo...' : `Tạo sản phẩm với ${accounts.length} tài khoản`}
            </Button>
            <Button type="button" variant="outline" onClick={() => window.location.reload()}>
              Hủy
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default MultiSteamAccountForm;

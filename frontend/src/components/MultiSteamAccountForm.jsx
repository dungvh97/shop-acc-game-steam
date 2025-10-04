import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Input } from './ui/input';
import { useToast } from '../hooks/use-toast';
import {
  createSteamAccount,
  getGameNames,
  uploadImage,
  getAccountInfoById,
  updateAccountInfo,
  updateSteamAccount
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

const MultiSteamAccountForm = ({ selectedAccountInfoId = null, selectedAccountInfoData = null }) => {
  const { toast } = useToast();
  
  // Form state
  const [accounts, setAccounts] = useState([
    {
      accountCode: '',
      username: '',
      password: '',
      steamGuard: '',
      status: 'IN_STOCK'
    }
  ]);
  
  // Common fields (same for all accounts)
  const [commonFields, setCommonFields] = useState({
    name: '',
    description: '',
    imageUrl: '',
    accountType: 'MULTI_GAMES',
    classify: 'STOCK',
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
  const [savingEdits, setSavingEdits] = useState(false);

  const accountTypes = [
    'MULTI_GAMES',
    'ONE_GAME',
    'DISCOUNTED',
    'OTHER_ACCOUNT'
  ];

  // Vietnamese display with specific account stock status - map with AccountStockStatus
  const allAccountStockOptions = [
    { value: 'IN_STOCK', label: 'Có sẵn trong kho' },
    { value: 'SOLD', label: 'Đã bán' },
    { value: 'MAINTENANCE', label: 'Lỗi, bảo trì' },
    { value: 'PRE_ORDER', label: 'Chưa đặt hàng' },
    { value: 'ORDERING', label: 'Đang đặt hàng' },
    { value: 'DELIVERED', label: 'Đã hoàn thành' },
    { value: 'CANCELLED', label: 'Đã hủy' },
  ];

  // Get filtered status options based on classification
  const getAccountStockOptions = (classify) => {
    if (classify === 'STOCK') {
      return allAccountStockOptions.filter(option => 
        ['IN_STOCK', 'SOLD', 'MAINTENANCE'].includes(option.value)
      );
    } else if (classify === 'ORDER') {
      return allAccountStockOptions.filter(option => 
        ['PRE_ORDER', 'ORDERING', 'DELIVERED', 'CANCELLED'].includes(option.value)
      );
    }
    return allAccountStockOptions;
  };

  // Load games on mount
  useEffect(() => {
    loadGames();
  }, []);

  // If editing an existing AccountInfo, fetch and prefill common fields
  useEffect(() => {
    const loadAccountInfo = async () => {
      if (!selectedAccountInfoId) return;
      try {
        const info = await getAccountInfoById(selectedAccountInfoId);
        if (info) {
          setCommonFields((prev) => ({
            ...prev,
            name: info.name || prev.name,
            description: info.description || prev.description,
            imageUrl: info.imageUrl || prev.imageUrl,
            accountType: info.accountType || prev.accountType,
            classify: info.classify || prev.classify,
            price: info.price ?? prev.price,
            originalPrice: info.originalPrice ?? prev.originalPrice,
            discountPercentage: typeof info.discountPercentage === 'number' ? info.discountPercentage : prev.discountPercentage,
            // Not overriding stockQuantity here since editing existing stock may be a separate flow
            gameIds: Array.isArray(info.gameIds) ? info.gameIds : prev.gameIds,
          }));
        }
      } catch (e) {
        console.error('Failed to load AccountInfo for edit:', e);
        toast({ title: 'Không thể tải sản phẩm', description: e.message || 'Vui lòng thử lại', variant: 'destructive' });
      }
    };
    loadAccountInfo();
  }, [selectedAccountInfoId]);

  // Prefill accounts list from the provided selectedAccountInfoData (steamAccounts)
  useEffect(() => {
    if (!selectedAccountInfoData || !Array.isArray(selectedAccountInfoData.steamAccounts)) return;
    const mapped = selectedAccountInfoData.steamAccounts.map(sa => ({
      id: sa.id,
      accountCode: sa.accountCode || (sa.itemCode?.startsWith('SA-') ? '' : (sa.itemCode || '')), // prefer raw accountCode
      username: sa.username || '',
      password: sa.password || '',
      steamGuard: sa.steamGuard || '',
      status: sa.status || 'IN_STOCK'
    }));
    if (mapped.length > 0) {
      setAccounts(mapped);
      setCommonFields(prev => ({ ...prev, stockQuantity: mapped.length }));
    }
  }, [selectedAccountInfoData]);

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

  // Save edits for existing AccountInfo and its Steam accounts
  const handleSaveEdits = async () => {
    if (!selectedAccountInfoId) {
      toast({ title: 'Không có sản phẩm để chỉnh sửa', variant: 'destructive' });
      return;
    }
    // Basic validation similar to create flow (allow empty password for existing accounts)
    const hasName = commonFields.name && commonFields.name.trim();
    const hasGames = Array.isArray(commonFields.gameIds) && commonFields.gameIds.length > 0;
    const hasPrice = commonFields.price && Number(commonFields.price) > 0;
    if (!hasName || !hasGames || !hasPrice) {
      toast({ title: 'Thiếu thông tin', description: 'Vui lòng kiểm tra Tên sản phẩm, Giá và Game', variant: 'destructive' });
      return;
    }
    setSavingEdits(true);
    try {
      // 1) Update AccountInfo
      await updateAccountInfo(selectedAccountInfoId, {
        name: commonFields.name,
        description: commonFields.description,
        imageUrl: commonFields.imageUrl,
        accountType: commonFields.accountType,
        classify: commonFields.classify,
        price: commonFields.price,
        originalPrice: commonFields.originalPrice || null,
        discountPercentage: commonFields.discountPercentage ? Number(commonFields.discountPercentage) : 0,
        stockQuantity: Number(commonFields.stockQuantity || 0),
        gameIds: commonFields.gameIds
      });

      // 2) Update each Steam Account
      for (const acc of accounts) {
        if (!acc.id) continue; // skip accounts without id (creation not handled here)
        const payload = {
          // common fields applied to each account
          accountType: commonFields.accountType,
          status: acc.status || 'IN_STOCK',
          price: commonFields.price,
          originalPrice: commonFields.originalPrice || null,
          discountPercentage: commonFields.discountPercentage ? Number(commonFields.discountPercentage) : 0,
          imageUrl: commonFields.imageUrl,
          stockQuantity: Number(commonFields.stockQuantity || 0),
          description: commonFields.description,
          gameIds: commonFields.gameIds,
          // account-specific fields
          accountCode: acc.accountCode,
          username: acc.username,
          steamGuard: acc.steamGuard,
        };
        if (acc.password && acc.password.trim()) {
          payload.password = acc.password;
        }
        await updateSteamAccount(acc.id, payload);
      }

      toast({ title: 'Đã lưu chỉnh sửa' });
    } catch (error) {
      toast({ title: 'Lưu chỉnh sửa thất bại', description: error.message || 'Không thể lưu chỉnh sửa', variant: 'destructive' });
    } finally {
      setSavingEdits(false);
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
      status: 'IN_STOCK'
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
        status: 'IN_STOCK'
      });
    }
    setAccounts(newAccounts);
  };

  // Handle stock quantity change
  const handleStockQuantityChange = (value) => {
    const quantity = parseInt(value) || 0;
    // Treat ORDER same as STOCK: require at least 1 and manage accounts list
    const enforcedQty = quantity < 1 ? 1 : quantity;
    setCommonFields({...commonFields, stockQuantity: enforcedQty});
    
    // Auto-generate accounts if quantity is greater than current accounts
    if (enforcedQty > accounts.length) {
      generateAccountsFromStock(enforcedQty);
    } else if (enforcedQty < accounts.length) {
      // Remove excess accounts
      setAccounts(accounts.slice(0, enforcedQty));
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
    
    // STOCK and ORDER both require stock >= 1
    if (!commonFields.stockQuantity || commonFields.stockQuantity < 1) {
      errors.stockQuantity = 'Số lượng kho phải lớn hơn hoặc bằng 1';
    }
    
    // Image is required
    if (!selectedFile && (!commonFields.imageUrl || !`${commonFields.imageUrl}`.trim())) {
      errors.imageUrl = 'Vui lòng chọn hình ảnh tài khoản';
    }
    
    // Validate individual accounts
    if (commonFields.classify === 'STOCK' || commonFields.classify === 'ORDER') {
      accounts.forEach((account, index) => {
        const accountStatus = account.status || 'IN_STOCK';
        const isAvailable = accountStatus === 'IN_STOCK';
        if (isAvailable) {
          if (!account.accountCode.trim()) {
            errors[`account_${index}_accountCode`] = 'Mã sản phẩm không được để trống';
          }
        }
      });
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: 'Lỗi xác thực',
        description: 'Vui lòng kiểm tra đã điền đầy đủ các trường bắt buộc.',
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
        classify: commonFields.classify,
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
        status: 'IN_STOCK'
      }]);
      setCommonFields({
        name: '',
        description: '',
        imageUrl: '',
        accountType: 'MULTI_GAMES',
        classify: 'STOCK',
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
        {selectedAccountInfoId && (
          <div className="mb-4 p-3 rounded border bg-purple-50 text-purple-900 text-sm">
            Đang chỉnh sửa sản phẩm AccountInfo #{selectedAccountInfoId}. Các trường thông tin chung đã được điền trước. Bạn có thể cập nhật thêm tài khoản Steam cho sản phẩm này.
          </div>
        )}
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
                <label className="text-sm font-medium">Phân loại *</label>
                <select
                  className="w-full border rounded h-10 px-3"
                  value={commonFields.classify}
                  onChange={(e) => {
                    const next = e.target.value;
                    // Treat ORDER like STOCK: ensure stockQuantity at least 1 and manage accounts
                    const nextQty = !commonFields.stockQuantity || commonFields.stockQuantity < 1 ? 1 : commonFields.stockQuantity;
                    setCommonFields({ ...commonFields, classify: next, stockQuantity: nextQty });
                    
                    // Normalize account statuses according to classification
                    setAccounts((prev) => {
                      const validStatuses = getAccountStockOptions(next);
                      const defaultStatus = next === 'ORDER' ? 'PRE_ORDER' : 'IN_STOCK';
                      
                      return (prev || []).map(acc => {
                        // If current status is valid for new classification, keep it
                        if (validStatuses.some(opt => opt.value === acc.status)) {
                          return acc;
                        }
                        // Otherwise, set to default status for the classification
                        return { ...acc, status: defaultStatus };
                      });
                    });
                    
                    // Clear validation errors when classification changes
                    setValidationErrors({});
                    
                    if (accounts.length === 0 && nextQty > 0) {
                      generateAccountsFromStock(nextQty);
                    }
                  }}
                  required
                >
                  <option value="STOCK">Có sẵn</option>
                  <option value="ORDER">Đặt hàng</option>
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
                <label className="text-sm font-medium">Số lượng kho *</label>
                <Input
                  type="number"
                  min={'1'}
                  value={commonFields.stockQuantity}
                  onChange={(e) => {
                    handleStockQuantityChange(e.target.value);
                  }}
                  required
                  className={validationErrors.stockQuantity ? 'border-red-500 focus:border-red-500' : ''}
                />
                {validationErrors.stockQuantity && (
                  <div className="text-xs text-red-600 mt-1">{validationErrors.stockQuantity}</div>
                )}
                <div className="text-xs text-gray-500 mt-1">Số lượng này sẽ tự động tạo ra các tài khoản tương ứng</div>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium">Hình ảnh Tài khoản *</label>
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
                {validationErrors.imageUrl && (
                  <div className="text-xs text-red-600 mt-1">{validationErrors.imageUrl}</div>
                )}
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium">Mô tả</label>
              <textarea
                value={commonFields.description}
                onChange={(e) => setCommonFields({ ...commonFields, description: e.target.value })}
                placeholder="Mô tả tài khoản..."
                rows={4}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
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
          {(commonFields.classify === 'STOCK' || commonFields.classify === 'ORDER') && (
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
                  {/* Move status to the first position with Vietnamese labels and order */}
                  <div>
                    <label className="text-sm font-medium">Trạng thái tài khoản *</label>
                    <select
                      className="w-full border rounded h-10 px-3"
                      value={account.status}
                      onChange={(e) => updateAccount(index, 'status', e.target.value)}
                      required
                    >
                      {getAccountStockOptions(commonFields.classify).map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Mã sản phẩm *</label>
                    <Input
                      value={account.accountCode}
                      onChange={(e) => updateAccount(index, 'accountCode', e.target.value)}
                      required={account.status === 'IN_STOCK'}
                      className={validationErrors[`account_${index}_accountCode`] ? 'border-red-500 focus:border-red-500' : ''}
                    />
                    {validationErrors[`account_${index}_accountCode`] && (
                      <div className="text-xs text-red-600 mt-1">{validationErrors[`account_${index}_accountCode`]}</div>
                    )}
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Tên đăng nhập</label>
                    <Input
                      value={account.username}
                      onChange={(e) => updateAccount(index, 'username', e.target.value)}
                      className={validationErrors[`account_${index}_username`] ? 'border-red-500 focus:border-red-500' : ''}
                    />
                    {validationErrors[`account_${index}_username`] && (
                      <div className="text-xs text-red-600 mt-1">{validationErrors[`account_${index}_username`]}</div>
                    )}
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Mật khẩu</label>
                    <Input
                      type="text"
                      value={account.password}
                      onChange={(e) => updateAccount(index, 'password', e.target.value)}
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
                </div>
              </Card>
            ))}
          </div>
          )}

          <div className="flex gap-2">
            <Button type="submit" disabled={submitting || uploadingImage}>
              {submitting ? 'Đang tạo...' : `Tạo sản phẩm với ${accounts.length} tài khoản`}
            </Button>
            {selectedAccountInfoId && (
              <Button type="button" variant="outline" onClick={handleSaveEdits} disabled={savingEdits}>
                {savingEdits ? 'Đang lưu...' : 'Lưu chỉnh sửa'}
              </Button>
            )}
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
